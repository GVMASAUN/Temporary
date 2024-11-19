import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeactivateConfirmDialogComponent } from './deactivate-confirm-dialog.component';

describe('DeactivateConfirmDialogComponent', () => {
  let component: DeactivateConfirmDialogComponent;
  let fixture: ComponentFixture<DeactivateConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeactivateConfirmDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeactivateConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
