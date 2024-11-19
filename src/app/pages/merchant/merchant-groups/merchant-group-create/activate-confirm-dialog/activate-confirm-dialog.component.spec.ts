import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateConfirmDialogComponent } from './activate-confirm-dialog.component';

describe('ActivateConfirmDialogComponent', () => {
  let component: ActivateConfirmDialogComponent;
  let fixture: ComponentFixture<ActivateConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivateConfirmDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
