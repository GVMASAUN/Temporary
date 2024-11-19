import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UncategorizedOffersComponent } from './uncategorized-offers.component';

describe('UncategorizedOffersComponent', () => {
  let component: UncategorizedOffersComponent;
  let fixture: ComponentFixture<UncategorizedOffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UncategorizedOffersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UncategorizedOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
