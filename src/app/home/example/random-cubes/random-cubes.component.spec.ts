import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomCubesComponent } from './random-cubes.component';

describe('RandomCubesComponent', () => {
  let component: RandomCubesComponent;
  let fixture: ComponentFixture<RandomCubesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RandomCubesComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RandomCubesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
