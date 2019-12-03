import { Component, ElementRef, OnInit, ViewChild, HostListener, AfterViewInit } from '@angular/core';
import { RandomCubeServiceService } from '../random-cube-service.service';
import { Maze } from '../../../maze/models/maze';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

let interval;

// Mapping button index to each button
// Each joycon contains 11 buttons indexed
const buttonMapping = {
  0: 'B',
  1: 'A',
  2: 'Y',
  3: 'X',
  4: 'L',
  5: 'R',
  6: 'ZL', // {pressed: true, touched: true, value: 1}
  7: 'ZR',
  8: '-',
  9: '+',
  10: '3D left',
  11: '3D right',
  12: 'Arrow Up',
  13: 'Arrow Down',
  14: 'Arrow Left',
  15: 'Arrow Right',
  16: 'Home',
  17: 'Capture',
  18: 'SL left', // left
  19: 'SR right', // left
  20: 'SL left', // right
  21: 'SR right' // right
};

@Component({
  selector: 'app-random-cubes',
  templateUrl: './random-cubes.component.html',
  styleUrls: ['./random-cubes.component.scss']
})
export class RandomCubesComponent implements OnInit, AfterViewInit {
  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLCanvasElement>;

  title = 'maze';
  row = 20;
  col = 30;
  length = 20;
  wallWidthX = 1000;
  wallHeightY = 1000;
  wallDepthZ = 2000;
  cellWidth = 1000;

  controlForm: FormGroup;
  top: FormControl;
  bottom: FormControl;
  left: FormControl;
  right: FormControl;
  rotateTopBottom: FormControl;
  rotateRightLeft: FormControl;

  message: string;
  axes: string;
  timestamp: string;
  pressed = false;
  touched = false;
  buttonValue = 0;

  x: number;
  y: number;
  z: number;
  rX: number;
  rY: number;
  rZ: number;

  action: any;
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

  @HostListener('window:gamepadconnected', ['$event'])
  gamePadConnected(e: any) {
    const gamepad = e.gamepad;
    console.log(`Gamepad connected at index ${gamepad.index}: ${gamepad.id}.
              ${gamepad.buttons.length} buttons, ${gamepad.axes.length} axes.`);
  }

  ngAfterViewInit() {
    if (!('ongamepadconnected' in window)) {
      // No gamepad events available, poll instead.
      interval = setInterval(this.pollGamepads, 100);
    }
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
    this.rotateRightLeft = new FormControl(-90, []);
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

  onMouseDown(action: string, direction: string) {
    this.action = setInterval(() => {
      this.randomCubesService.navigate(action, direction, 200);
    }, 100);
  }

  stopAction() {
    clearInterval(this.action);
  }

  pollGamepads() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gamepadArray = [];

    for (const gamepad of gamepads) {
      gamepadArray.push(gamepad);
    }
    console.log('polling pads', gamepadArray);
    const orderedGamepads = [];
    // orderedGamepads.push(gamepadArray.find(g => g && g.id.indexOf('GAMEPAD Vendor: 057e Product: 200e') > -1));
    orderedGamepads.push(gamepadArray.find(g => g && g.id.indexOf('STANDARD GAMEPAD Vendor: 057e') > -1));

    for (const orderedGamepad of orderedGamepads) {
      if (orderedGamepad) {
        console.log('orderedGamepad', orderedGamepad);
        this.axes = orderedGamepad.axes.toString();
        if (this.axes !== '0,0,0,0') {
          console.log('axes', this.axes);
          const a = orderedGamepad.axes[0];
          const b = orderedGamepad.axes[1];
          const c = orderedGamepad.axes[2];
          const d = orderedGamepad.axes[3];

          let action;
          let direction;
          // Left axes
          if (c === 0 && d === 0) {
            action = 'leftJoy';
            if (a > 0 && b < 0) {
              direction = 'up';
            } else if (a > 0 && b > 0) {
              direction = 'down';
            } else if (a < 0 && b < 0) {
              direction = 'rotateLeft';
            } else if (a < 0 && b > 0) {
              direction = 'rotateRight';
            }
          } else if (a === 0 && b === 0) {
            // Right axes
            action = 'rightJoy';
            if (c < 0 && d > 0) {
              direction = 'forward';
            } else if (c > 0 && d > 0) {
              direction = 'backward';
            } else if (c < 0 && d < 0) {
              direction = 'L';
            } else if (c > 0 && d < 0) {
              direction = 'R';
            }
          }
          this.randomCubesService.navigate(action, direction, 100);
        }
        this.timestamp = orderedGamepad.timestamp.toString();
        const buttons = orderedGamepad.buttons;
        let i = 0;
        for (const button of buttons) {
          if (button.pressed) {
            this.pressed = true;
            this.buttonValue = button.value;
            this.message = buttonMapping[i];
            console.log('pressed', this.message, i);
            if (this.message === 'X') {
              (orderedGamepad as any).vibrationActuator.playEffect('dual-rumble', {
                startDelay: 0,
                duration: 1000,
                weakMagnitude: 0.5,
                strongMagnitude: 0.5
              });
            }
          } else {
            this.pressed = false;
          }

          if (button.touched) {
            this.touched = true;
            this.buttonValue = button.value;
            this.message = buttonMapping[i];
            console.log('touched', this.message);
          } else {
            this.touched = false;
          }
          i++;
        }
      }
    }
  }
}
