import * as THREE from 'three';
import { Injectable, ElementRef, OnDestroy, NgZone } from '@angular/core';
import { PlaneGeometry, AmbientLight } from 'three';
import { Maze } from '../../maze/models/maze';

@Injectable({
  providedIn: 'root'
})
export class RandomCubeServiceService implements OnDestroy {
  numberOfObjects = 0;
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private plane: THREE.Mesh;

  private cube: THREE.Mesh;
  private sphere: THREE.Mesh;
  private light: THREE.AmbientLight;
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
    console.log('values', values);
    // this.camera.translateX(values.left);
    // this.camera.translateY(values.top);
    // this.camera.translateZ(values.bottom);
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
    this.scene.add(this.camera);

    // Test
    const axes = new THREE.AxesHelper(20);
    this.scene.add(axes);

    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 24000;
    /// this.camera.lookAt(this.scene.position);
    this.camera.translateX((maze.nCol * cellWidth) / 2);
    this.camera.translateY(-(maze.nRow * cellWidth) / 2);

    this.addPlane(maze.nCol, maze.nRow, wallWidthX, wallHeightY);

    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(100, 200, maze.nCol * wallDepthZ);
    spotLight.castShadow = true;
    // spotLight.target = this.plane;
    this.scene.add(spotLight);

    // this.scene.fog = new THREE.Fog( 0xffffff, 0.015, 100);
    // this.scene.fog = new THREE.FogExp2( 0xffffff, 0.01);
    // this.scene.overrideMaterial = new THREE.MeshLambertMaterial({
    //   color: 0xffffff
    // });

    // this.scene.overrideMaterial = new THREE.MeshPhongMaterial({
    //   color: 0x7777ff
    // });

    // const ambiColor = '#ffffff';
    // const ambientColor = new THREE.AmbientLight(ambiColor);
    // this.scene.add(ambientColor);

    // const hemiLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.6);
    // hemiLight.position.set(0, 500, 0);
    // this.sphere.add(hemiLight);

    // this.createSprites();
    this.drawWalls(maze, wallWidthX, wallHeightY, wallDepthZ, cellWidth);

    // const cubeGeometry = new THREE.BoxGeometry(100, wallHeightY, wallDepthZ);
    // const cubeMaterial = new THREE.MeshLambertMaterial({
    //   color: 0x00ffff // Math.random() * 0xffffff
    // });
    // this.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    // this.cube.castShadow = true;
    // this.cube.name = `cube-${this.scene.children.length}`;
    // this.cube.position.x = 0;

    // this.cube.position.y = 0;
    // this.cube.position.z = 0;
    // this.cube.castShadow = true;
    // this.scene.add(this.cube);
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
      color: 0x7777ee
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
      nCol * wallWidthX + wallWidthX * 2 + wallWidthX,
      nRow * wallHeightY + wallHeightY * 2 + wallHeightY,
      1,
      1
    );
    const planeMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff
    });
    this.plane = new THREE.Mesh(this.planeGeometry, planeMaterial);
    this.plane.position.x = (nCol * wallWidthX) / 2 - wallWidthX;
    this.plane.position.y = -((nRow * wallHeightY) / 2 - wallWidthX);
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
    this.cube.position.z = wallDepthZ + wallDepthZ / 2;
    this.cube.castShadow = true;

    this.scene.add(this.cube);
  }
}
