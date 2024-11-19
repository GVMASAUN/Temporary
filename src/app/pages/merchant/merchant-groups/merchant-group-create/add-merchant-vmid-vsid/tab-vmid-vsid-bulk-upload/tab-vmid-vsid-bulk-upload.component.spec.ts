import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabVmidVsidBulkUploadComponent } from './tab-vmid-vsid-bulk-upload.component';

describe('TabVmidVsidBulkUploadComponent', () => {
  let component: TabVmidVsidBulkUploadComponent;
  let fixture: ComponentFixture<TabVmidVsidBulkUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabVmidVsidBulkUploadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabVmidVsidBulkUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
