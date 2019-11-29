import * as THREE from 'three';
import { Injectable, ElementRef, OnDestroy, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EngineService implements OnDestroy {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.AmbientLight;
  private step = 0;

  private cube: THREE.Mesh;
  private sphere: THREE.Mesh;

  private frameId: number = null;

  public constructor(private ngZone: NgZone) {}

  public ngOnDestroy() {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  createScene(canvas: ElementRef<HTMLCanvasElement>): void {
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

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // this.camera.position.z = 5;
    // this.scene.add(this.camera);

    // soft white light
    // this.light = new THREE.AmbientLight(0x404040);
    // this.light.position.z = 10;
    // this.scene.add(this.light);

    // const geometry = new THREE.BoxGeometry(1, 1, 1);
    // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // this.cube = new THREE.Mesh(geometry, material);
    // this.scene.add(this.cube);

    // Test
    const axes = new THREE.AxesHelper(20);
    this.scene.add(axes);
    const planeGeometry = new THREE.PlaneGeometry(60, 20);
    const planeMaterial = new THREE.MeshLambertMaterial({
      // MeshBasicMaterial
      color: 0xffffff
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 15;
    plane.position.y = 0;
    plane.position.z = 0;
    plane.receiveShadow = true;
    this.scene.add(plane);

    const cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
    const cubeMaterial = new THREE.MeshLambertMaterial({
      color: 0xff0000,
      wireframe: false
    });
    this.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    this.cube.position.x = -4;
    this.cube.position.y = 3;
    this.cube.position.z = 0;
    this.cube.castShadow = true;
    this.scene.add(this.cube);

    const sphereGeometry = new THREE.SphereGeometry(4, 20, 20);
    const sphereMaterial = new THREE.MeshLambertMaterial({
      color: 0x7777ff,
      wireframe: false
    });
    this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.sphere.position.x = 20;
    this.sphere.position.y = 4;
    this.sphere.position.z = 2;
    this.sphere.castShadow = true;
    this.scene.add(this.sphere);

    this.camera.position.x = -30;
    this.camera.position.y = 40;
    this.camera.position.z = 30;
    this.camera.lookAt(this.scene.position);

    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, -10);
    spotLight.castShadow = true;
    this.scene.add(spotLight);
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

    this.step += 0.04;
    this.sphere.position.x = 20 + 10 * Math.cos(this.step);
    this.sphere.position.y = 2 + 10 * Math.abs(Math.sin(this.step));
    this.cube.rotation.x += 0.02;
    this.cube.rotation.y += 0.02;
    this.cube.rotation.z += 0.02;
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
}
