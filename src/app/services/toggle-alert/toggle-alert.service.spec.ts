import { TestBed } from '@angular/core/testing';

import { ToggleAlertService } from './toggle-alert.service';

describe('ToggleAlertService', () => {
  let service: ToggleAlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToggleAlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
