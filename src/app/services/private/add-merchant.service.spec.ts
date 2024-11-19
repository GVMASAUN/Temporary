import { TestBed } from '@angular/core/testing';

import { AddMerchantService } from './add-merchant.service';

describe('AddMerchantService', () => {
  let service: AddMerchantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddMerchantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
