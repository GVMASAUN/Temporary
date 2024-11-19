import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmAssignModalComponent } from './confirm-assign-modal.component';

describe('ConfirmAssignModalComponent', () => {
  let component: ConfirmAssignModalComponent;
  let fixture: ComponentFixture<ConfirmAssignModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmAssignModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmAssignModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
