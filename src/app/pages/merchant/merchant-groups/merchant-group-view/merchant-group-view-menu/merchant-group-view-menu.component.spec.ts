import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantGroupViewMenuComponent } from './merchant-group-view-menu.component';

describe('MerchantGroupViewMenuComponent', () => {
  let component: MerchantGroupViewMenuComponent;
  let fixture: ComponentFixture<MerchantGroupViewMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MerchantGroupViewMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantGroupViewMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
