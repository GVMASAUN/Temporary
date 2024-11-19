import { TestBed } from '@angular/core/testing';

import { NavStatusService } from './nav-status.service';

describe('NavStatusService', () => {
  let service: NavStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
