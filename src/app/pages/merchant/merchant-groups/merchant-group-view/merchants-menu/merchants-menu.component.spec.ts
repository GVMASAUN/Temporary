import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantsMenuComponent } from './merchants-menu.component';

describe('MerchantsMenuComponent', () => {
  let component: MerchantsMenuComponent;
  let fixture: ComponentFixture<MerchantsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MerchantsMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
