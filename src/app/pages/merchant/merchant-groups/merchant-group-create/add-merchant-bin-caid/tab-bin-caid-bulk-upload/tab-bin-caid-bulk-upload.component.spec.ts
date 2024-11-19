import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabBinCaidBulkUploadComponent } from './tab-bin-caid-bulk-upload.component';

describe('TabBinCaidBulkUploadComponent', () => {
  let component: TabBinCaidBulkUploadComponent;
  let fixture: ComponentFixture<TabBinCaidBulkUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabBinCaidBulkUploadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabBinCaidBulkUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
