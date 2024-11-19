import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEventActionComponent } from './add-event-action.component';

describe('AddEventActionComponent', () => {
  let component: AddEventActionComponent;
  let fixture: ComponentFixture<AddEventActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEventActionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEventActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
