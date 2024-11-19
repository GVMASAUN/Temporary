import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateTimeFieldValueComponent } from './date-time-field-value.component';

describe('DateTimeFieldValueComponent', () => {
  let component: DateTimeFieldValueComponent;
  let fixture: ComponentFixture<DateTimeFieldValueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DateTimeFieldValueComponent]
    });
    fixture = TestBed.createComponent(DateTimeFieldValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
