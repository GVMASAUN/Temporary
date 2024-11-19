import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMerchantsComponent } from './create-merchants.component';

describe('CreateMerchantsComponent', () => {
  let component: CreateMerchantsComponent;
  let fixture: ComponentFixture<CreateMerchantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateMerchantsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMerchantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
