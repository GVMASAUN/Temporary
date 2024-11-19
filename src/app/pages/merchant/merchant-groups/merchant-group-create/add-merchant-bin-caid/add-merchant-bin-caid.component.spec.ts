import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMerchantBinCaidComponent } from './add-merchant-bin-caid.component';

describe('AddMerchantBinCaidComponent', () => {
  let component: AddMerchantBinCaidComponent;
  let fixture: ComponentFixture<AddMerchantBinCaidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMerchantBinCaidComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMerchantBinCaidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
