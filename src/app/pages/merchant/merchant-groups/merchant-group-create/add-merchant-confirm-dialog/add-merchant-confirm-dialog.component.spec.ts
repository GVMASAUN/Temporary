import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMerchantConfirmDialogComponent } from './add-merchant-confirm-dialog.component';

describe('AddMerchantConfirmDialogComponent', () => {
  let component: AddMerchantConfirmDialogComponent;
  let fixture: ComponentFixture<AddMerchantConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMerchantConfirmDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMerchantConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
