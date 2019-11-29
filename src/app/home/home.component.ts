import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';

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
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  message: string;
  axes: string;
  timestamp: string;
  pressed = false;
  touched = false;
  buttonValue = 0;
  threejs: any;

  constructor() {}

  @HostListener('window:gamepadconnected', ['$event'])
  gamePadConnected(e: any) {
    const gamepad = e.gamepad;
    console.log(`Gamepad connected at index ${gamepad.index}: ${gamepad.id}.
              ${gamepad.buttons.length} buttons, ${gamepad.axes.length} axes.`);
  }

  ngOnInit() {}

  ngAfterViewInit() {
    if (!('ongamepadconnected' in window)) {
      // No gamepad events available, poll instead.
      interval = setInterval(this.pollGamepads, 100);
    }
  }

  pollGamepads() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gamepadArray = [];

    for (const gamepad of gamepads) {
      gamepadArray.push(gamepad);
    }
    const orderedGamepads = [];
    orderedGamepads.push(gamepadArray.find(g => g && g.id.indexOf('GAMEPAD Vendor: 057e Product: 200e') > -1));

    for (const orderedGamepad of orderedGamepads) {
      if (orderedGamepad) {
        console.log('orderedGamepad', orderedGamepad);
        this.axes = orderedGamepad.axes.toString();
        if (this.axes !== '0,0,0,0') {
          console.log('axes', this.axes);
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
