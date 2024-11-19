import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMerchantsComponent } from './edit-merchants.component';

describe('EditMerchantsComponent', () => {
  let component: EditMerchantsComponent;
  let fixture: ComponentFixture<EditMerchantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditMerchantsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMerchantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
