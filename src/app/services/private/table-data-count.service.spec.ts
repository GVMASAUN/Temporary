import { TestBed } from '@angular/core/testing';

import { TableDataCountService } from './table-data-count.service';

describe('TableDataCountService', () => {
  let service: TableDataCountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableDataCountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
