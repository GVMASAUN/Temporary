import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantGroupEditComponent } from './merchant-group-edit.component';

describe('MerchantGroupEditComponent', () => {
  let component: MerchantGroupEditComponent;
  let fixture: ComponentFixture<MerchantGroupEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MerchantGroupEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantGroupEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
