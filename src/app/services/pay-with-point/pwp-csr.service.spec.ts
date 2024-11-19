import { TestBed } from '@angular/core/testing';

import { PwpCsrService } from './pwp-csr.service';

describe('PwpCsrService', () => {
  let service: PwpCsrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PwpCsrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
