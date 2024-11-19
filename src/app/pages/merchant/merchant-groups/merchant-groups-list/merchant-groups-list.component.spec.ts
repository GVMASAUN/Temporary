import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantGroupsListComponent } from './merchant-groups-list.component';

describe('MerchantGroupsListComponent', () => {
  let component: MerchantGroupsListComponent;
  let fixture: ComponentFixture<MerchantGroupsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MerchantGroupsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantGroupsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
