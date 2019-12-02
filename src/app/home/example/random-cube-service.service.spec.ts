import { TestBed } from '@angular/core/testing';

import { RandomCubeServiceService } from './random-cube-service.service';

describe('RandomCubeServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RandomCubeServiceService = TestBed.get(RandomCubeServiceService);
    expect(service).toBeTruthy();
  });
});
