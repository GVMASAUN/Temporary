import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMerchantVmidVsidComponent } from './add-merchant-vmid-vsid.component';

describe('AddMerchantVmidVsidComponent', () => {
  let component: AddMerchantVmidVsidComponent;
  let fixture: ComponentFixture<AddMerchantVmidVsidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMerchantVmidVsidComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMerchantVmidVsidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
