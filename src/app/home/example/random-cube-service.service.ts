import * as THREE from 'three';
import { Injectable, ElementRef, OnDestroy, NgZone } from '@angular/core';
import { PlaneGeometry, AmbientLight } from 'three';
import { Maze } from '../../maze/models/maze';

@Injectable({
  providedIn: 'root'
})
export class RandomCubeServiceService implements OnDestroy {
  numberOfObjects = 0;
  lookAtX = 1000;
  lookAtY = 0;
  lookAtZ = 2500;
  cameraAtX = 0;
  cameraAtY = 0;
  cameraAtZ = 2500;
  loader: THREE.TextureLoader;
  dist = 1000;
  theta = 2;
  headLight: THREE.SpotLight;
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private plane: THREE.Mesh;

  private cube: THREE.Mesh;
  private sphere: THREE.Mesh;
  private axes: THREE.AxesHelper;
  private planeGeometry: THREE.PlaneGeometry;

  private frameId: number = null;

  public constructor(private ngZone: NgZone) {}

  public ngOnDestroy() {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  updateCamera() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  updatePlaneVision(values: any) {
    console.log('values rotateRightLeft', values.rotateRightLeft);
    this.camera.rotateZ((Math.PI / 180) * values.rotateRightLeft);
  }

  createScene(
    canvas: ElementRef<HTMLCanvasElement>,
    maze: Maze,
    wallWidthX: number,
    wallHeightY: number,
    wallDepthZ: number,
    cellWidth: number
  ): void {
    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true, // transparent background
      antialias: true // smooth edges
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(new THREE.Color(0xeeeeee));

    this.renderer.shadowMap.enabled = true;

    // create the scene
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      maze.nCol * wallDepthZ + wallDepthZ
    );

    // Test
    // this.axes = new THREE.AxesHelper(400);
    // this.scene.add(this.axes);

    this.camera.position.set(this.cameraAtX, this.cameraAtY, this.cameraAtZ);
    this.camera.up = new THREE.Vector3(0, 0, 1);
    this.camera.lookAt(new THREE.Vector3(this.lookAtX, this.lookAtY, this.lookAtZ));
    this.camera.setFocalLength(40);
    this.scene.add(this.camera);

    this.addPlane(maze.nCol, maze.nRow, wallWidthX, wallHeightY);

    // this.addSphere();

    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(1000, 2000, 40000);
    spotLight.castShadow = true;
    this.scene.add(spotLight);

    this.headLight = new THREE.SpotLight(0xffffff);
    this.headLight.castShadow = true;
    this.headLight.position.set(0, 0, 0);
    this.headLight.target.position.set(0, 0, 0);
    this.scene.add(this.headLight);

    this.loader = new THREE.TextureLoader();

    // const test =  new (THREE as any).CSS3DRenderer();
    // console.log('css3 rendere', test);

    // this.scene.fog = new THREE.Fog( 0xffffff, 0.015, 100);
    // this.scene.fog = new THREE.FogExp2( 0xffffff, 0.01);

    // this.scene.overrideMaterial = new THREE.MeshPhongMaterial({
    //   color: 0x7777ff
    // });

    // const ambiColor = '#ffffff';
    // const ambientColor = new THREE.AmbientLight(ambiColor);
    // this.scene.add(ambientColor);

    // const hemiLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.6);
    // hemiLight.position.set(0, 500, 0);
    // this.sphere.add(hemiLight);

    this.drawWalls(maze, wallWidthX, wallHeightY, wallDepthZ, cellWidth);
  }

  animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render();
        });
      }

      window.addEventListener('resize', () => {
        this.resize();
      });
    });
  }

  render() {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

    // this.step += 0.04;
    // this.sphere.position.x = 20 + 10 * Math.cos(this.step);
    // this.sphere.position.y = 2 + 10 * Math.abs(Math.sin(this.step));
    // this.cube.rotation.x += 0.02;
    // this.cube.rotation.y += 0.02;
    // this.cube.rotation.z += 0.02;
    // this.scene.traverse((obj: any) => {
    //   if (obj instanceof THREE.Mesh && obj !== this.plane) {
    //     obj.rotation.x += 0.02;
    //     obj.rotation.y += 0.02;
    //     obj.rotation.z += 0.02;
    //   }
    // })

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  initStats() {
    // const stats = new Stats();
    // stats.mode = 0;
    // stats.
  }

  addCube() {
    const cubeSize = Math.ceil(Math.random() * 3);
    const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMaterial = new THREE.MeshLambertMaterial({
      color: Math.random() * 0xffffff
    });
    this.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    this.cube.castShadow = true;
    this.cube.name = `cube-${this.scene.children.length}`;
    this.cube.position.x = -30 + Math.round(Math.random() * 100);

    this.cube.position.y = Math.round(Math.random() * 5);
    this.cube.position.z = -20 + Math.round(Math.random() * 50);
    this.cube.castShadow = true;

    this.scene.add(this.cube);
    this.numberOfObjects = this.scene.children.length;
  }

  createSprites() {
    const material = new THREE.SpriteMaterial({
      color: 0x000000
    });
    for (let x = -25; x < 25; x++) {
      for (let y = -25; y < 25; y++) {
        const sprite = new THREE.Sprite(material);
        sprite.position.set(x * 10, y * 10, 0);
        this.scene.add(sprite);
      }
    }
  }

  onDocumentMouseDown(event: any) {
    let vector = new THREE.Vector3(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
      0.5
    );
    vector = vector.unproject(this.camera);

    const raycaster = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());
    const intersects = raycaster.intersectObjects([this.cube]);
    if (intersects.length > 0) {
      intersects[0].object.customDepthMaterial.transparent = true;
      intersects[0].object.customDepthMaterial.opacity = 0.1;
    }
  }

  updateSphere(x: number, y: number, z: number) {
    this.sphere.position.x = x;
    this.sphere.position.y = y;
    this.sphere.position.z = z;
  }

  addSphere() {
    const sphereGeometry = new THREE.SphereGeometry(100);
    const sphereMaterial = new THREE.MeshLambertMaterial({
      color: 0x00ff00
    });
    this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.sphere.position.x = 0;
    this.sphere.position.y = 0;
    this.sphere.position.z = 0;
    this.scene.add(this.sphere);
  }

  drawWalls(maze: Maze, wallWidthX: number, wallHeightY: number, wallDepthZ: number, cellWidth: number) {
    for (let row = 0; row < maze.cells.length; row++) {
      for (let column = 0; column < maze.cells[row].length; column++) {
        const cell = maze.cells[row][column];
        // console.log('cell', cell);
        const wallPositionX = column * cellWidth;
        const wallPositionY = -(row * cellWidth);

        if (cell.eastWall) {
          this.addWall(
            wallPositionX + cellWidth / 2,
            wallPositionY,
            Math.round(wallWidthX / 50),
            wallHeightY,
            wallDepthZ
          );
        }

        if (cell.westWall) {
          this.addWall(
            wallPositionX - cellWidth / 2,
            wallPositionY,
            Math.round(wallWidthX / 50),
            wallHeightY,
            wallDepthZ
          );
        }

        if (cell.northWall) {
          this.addWall(
            wallPositionX,
            wallPositionY + cellWidth / 2,
            wallWidthX,
            Math.round(wallHeightY / 50),
            wallDepthZ
          );
        }

        if (cell.southWall) {
          this.addWall(
            wallPositionX,
            wallPositionY - cellWidth / 2,
            wallWidthX,
            Math.round(wallHeightY / 50),
            wallDepthZ
          );
        }
      }
    }
  }

  addPlane(nCol: number, nRow: number, wallWidthX: number, wallHeightY: number) {
    this.planeGeometry = new THREE.PlaneGeometry(
      nCol * wallWidthX + wallWidthX * 2 + wallWidthX * 3,
      nRow * wallHeightY + wallHeightY * 2 + wallHeightY * 3,
      100,
      100
    );
    const planeMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff
    });
    this.plane = new THREE.Mesh(this.planeGeometry, planeMaterial);
    this.plane.position.x = (nCol * wallWidthX) / 2 - wallWidthX * 2;
    this.plane.position.y = -((nRow * wallHeightY) / 2 - wallWidthX * 2);
    this.plane.position.z = 0;
    this.plane.receiveShadow = true;
    this.scene.add(this.plane);
  }

  addWall(wallPositionX: number, wallPositionY: number, wallWidthX: number, wallHeightY: number, wallDepthZ: number) {
    const cubeGeometry = new THREE.BoxGeometry(wallWidthX, wallHeightY, wallDepthZ);
    const cubeMaterial = new THREE.MeshLambertMaterial({
      color: 0x00ffff // Math.random() * 0xffffff
    });
    this.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    this.cube.castShadow = true;
    this.cube.name = `cube-${this.scene.children.length}`;

    this.cube.position.x = wallPositionX;
    this.cube.position.y = wallPositionY;
    this.cube.position.z = wallDepthZ;
    this.cube.translateZ(-this.cube.position.z);
    this.cube.castShadow = true;

    this.scene.add(this.cube);
  }

  navigate(action: string, direction: string, speed: number) {
    if (action === 'leftJoy') {
      if (direction === 'up') {
        this.movePlaneUp(speed);
      }

      if (direction === 'down') {
        this.movePlaneDown(speed);
      }

      if (direction === 'rotateLeft') {
        this.rotatePlaneLeft(speed);
      }

      if (direction === 'rotateRight') {
        this.rotatePlaneRight(speed);
      }
    } else if (action === 'rightJoy') {
      if (direction === 'forward') {
        this.movePlaneForward(speed);
      }

      if (direction === 'backward') {
        this.movePlaneBackward(speed);
      }
    }
  }

  setHeadLight() {
    // this.headLight.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
    // this.headLight.target.position.set(this.lookAtX, this.lookAtY, this.lookAtZ);
    // this.headLight.exponent = 3
  }

  movePlaneUp(speed: number) {
    this.cameraAtZ = this.cameraAtZ + speed;
    this.camera.position.z = this.cameraAtZ;
    this.lookAtZ = this.lookAtZ + speed;

    this.camera.up = new THREE.Vector3(0, 0, 1);
    this.camera.lookAt(new THREE.Vector3(this.lookAtX, this.lookAtY, this.lookAtZ));
    this.setHeadLight();
  }

  movePlaneDown(speed: number) {
    this.cameraAtZ = this.cameraAtZ - speed;
    this.camera.position.z = this.cameraAtZ;
    this.lookAtZ = this.lookAtZ - speed;

    this.camera.up = new THREE.Vector3(0, 0, 1);
    this.camera.lookAt(new THREE.Vector3(this.lookAtX, this.lookAtY, this.lookAtZ));
    this.setHeadLight();
  }

  rotatePlaneLeft(speed: number) {
    this.lookAtX = Math.cos((Math.PI / 180) * this.theta) * this.dist + this.lookAtX;
    this.lookAtY = -(Math.sin((Math.PI / 180) * this.theta) * this.dist) + this.lookAtY;

    this.camera.up = new THREE.Vector3(0, 0, 1);
    this.camera.lookAt(new THREE.Vector3(this.lookAtX, this.lookAtY, this.lookAtZ));

    if (this.theta === 0) {
      this.theta = 360;
    } else {
      this.theta -= 2;
    }
    this.setHeadLight();
  }

  rotatePlaneRight(speed: number) {
    this.lookAtX = Math.cos((Math.PI / 180) * this.theta) * this.dist + this.lookAtX;
    this.lookAtY = -(Math.sin((Math.PI / 180) * this.theta) * this.dist) + this.lookAtY;

    this.camera.up = new THREE.Vector3(0, 0, 1);
    this.camera.lookAt(new THREE.Vector3(this.lookAtX, this.lookAtY, this.lookAtZ));

    if (this.theta === 360) {
      this.theta = 2;
    } else {
      this.theta += 2;
    }
    this.setHeadLight();
  }

  movePlaneForward(speed: number) {
    // Find directional angle
    let angle = 0;
    if (this.lookAtX !== 0) {
      angle = Math.atan(this.lookAtY / this.lookAtX);
    }

    this.cameraAtX = this.cameraAtX + speed * 2;
    this.lookAtX = this.lookAtX + speed * 2;

    this.cameraAtY = this.cameraAtX * Math.tan(angle);
    this.lookAtY = this.lookAtX * Math.tan(angle);

    this.camera.position.set(this.cameraAtX, this.cameraAtY, this.cameraAtZ);
    this.camera.up = new THREE.Vector3(0, 0, 1);
    this.camera.lookAt(new THREE.Vector3(this.lookAtX, this.lookAtY, this.lookAtZ));
    this.setHeadLight();
  }

  movePlaneBackward(speed: number) {
    // Find directional angle
    let angle = 0;
    if (this.lookAtX !== 0) {
      angle = Math.atan(this.lookAtY / this.lookAtX);
    }
    this.cameraAtX = this.cameraAtX - speed * 2;
    this.lookAtX = this.lookAtX - speed * 2;

    this.cameraAtY = this.cameraAtX * Math.tan(angle);
    this.lookAtY = this.lookAtX * Math.tan(angle);

    this.camera.position.set(this.cameraAtX, this.cameraAtY, this.cameraAtZ);
    this.camera.up = new THREE.Vector3(0, 0, 1);
    this.camera.lookAt(new THREE.Vector3(this.lookAtX, this.lookAtY, this.lookAtZ));
    this.setHeadLight();
  }
}
