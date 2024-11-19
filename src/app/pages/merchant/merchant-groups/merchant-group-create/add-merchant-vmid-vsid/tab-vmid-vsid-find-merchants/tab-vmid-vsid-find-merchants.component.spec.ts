import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabVmidVsidFindMerchantsComponent } from './tab-vmid-vsid-find-merchants.component';

describe('TabVmidVsidFindMerchantsComponent', () => {
  let component: TabVmidVsidFindMerchantsComponent;
  let fixture: ComponentFixture<TabVmidVsidFindMerchantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabVmidVsidFindMerchantsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabVmidVsidFindMerchantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
