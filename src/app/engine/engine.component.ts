import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
import { EngineService } from './engine.service';

@Component({
  selector: 'app-engine',
  templateUrl: './engine.component.html'
})
export class EngineComponent implements OnInit {
  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLCanvasElement>;

  constructor(private engServ: EngineService) {}

  @HostListener('window:resize', ['$event'])
  onWindowResize(e: any) {
    console.log('e', e);
    this.engServ.updateCamera();
  }

  ngOnInit() {
    this.engServ.createScene(this.rendererCanvas);
    this.engServ.animate();
  }
}
