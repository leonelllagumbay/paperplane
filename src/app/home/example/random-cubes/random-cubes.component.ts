import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
import { RandomCubeServiceService } from '../random-cube-service.service';
import { Maze } from '../../../maze/models/maze';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'app-random-cubes',
  templateUrl: './random-cubes.component.html',
  styleUrls: ['./random-cubes.component.scss']
})
export class RandomCubesComponent implements OnInit {
  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLCanvasElement>;

  title = 'maze';
  row = 20;
  col = 30;
  length = 20;
  wallWidthX = 1000;
  wallHeightY = 1000;
  wallDepthZ = 1000;
  cellWidth = 1000;

  controlForm: FormGroup;
  top: FormControl;
  bottom: FormControl;
  left: FormControl;
  right: FormControl;
  rotateTopBottom: FormControl;
  rotateRightLeft: FormControl;
  private maze: Maze;
  private canvas: HTMLCanvasElement;

  constructor(private randomCubesService: RandomCubeServiceService, private readonly _fb: FormBuilder) {}

  @HostListener('window:resize', ['$event'])
  onWindowResize(e: any) {
    console.log('e', e);
    // this.randomCubesService.updateCamera();
  }

  @HostListener('window:mousedown', ['$event'])
  onWindowMouseDown(e: any) {
    console.log('mouse down');
    // this.randomCubesService.onDocumentMouseDown(e);
  }

  ngOnInit() {
    this.initControls();
    this.initForm();
    this.subscribeToValueChanges();
    this.canvas = document.getElementById('maze') as HTMLCanvasElement;
    this.drawMaze();
  }

  initControls() {
    this.top = new FormControl(100, []);
    this.bottom = new FormControl(-15000, []);
    this.left = new FormControl(15000, []);
    this.right = new FormControl(100, []);
    this.rotateTopBottom = new FormControl(100, []);
    this.rotateTopBottom = new FormControl(100, []);
  }

  initForm() {
    this.controlForm = this._fb.group({
      top: this.top,
      left: this.left,
      right: this.right,
      bottom: this.bottom,
      rotateRightLeft: this.rotateRightLeft,
      rotateTopBottom: this.rotateTopBottom
    });
  }

  subscribeToValueChanges() {
    this.controlForm.valueChanges.subscribe((values: any) => {
      this.randomCubesService.updatePlaneVision(values);
    });
  }

  drawMaze() {
    this.maze = new Maze(this.row, this.col);
    this.canvas.width = this.col * this.length;
    this.canvas.height = this.row * this.length;
    this.maze.draw(this.canvas, this.length);
    console.log('this maze', this.maze);
    this.randomCubesService.createScene(
      this.rendererCanvas,
      this.maze,
      this.wallWidthX,
      this.wallHeightY,
      this.wallDepthZ,
      this.cellWidth
    );
    this.randomCubesService.animate();
  }

  drawPath() {
    this.maze.drawPath(this.canvas, this.length);
  }
}
