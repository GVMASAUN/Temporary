import { Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ButtonColor } from '@visa/vds-angular';
import { Subject, takeUntil } from 'rxjs';
import { DialogButton } from 'src/app/core/dialog/dialog.model';
import { EnrollmentCollectionCreateComponent } from 'src/app/pages/enrollment-collection/create/enrollment-collection-create.component';
import { DialogService } from 'src/app/services/dialog/dialog.service';

@Component({
  selector: 'app-create-enrollment-collection-dialog',
  templateUrl: './create-enrollment-collection-dialog.component.html',
  styleUrls: ['./create-enrollment-collection-dialog.component.scss']
})
export class CreateEnrollmentCollectionDialogComponent implements OnDestroy {
  @ViewChild(EnrollmentCollectionCreateComponent)
  private enrollmentCollectionCreateComponent!: EnrollmentCollectionCreateComponent;

  private destroy$ = new Subject<void>();

  protected dialogButtons: DialogButton[] = [
    {
      label: 'Create',
      color: ButtonColor.PRIMARY,
      click: () => this.enrollmentCollectionCreateComponent?.saveEnrollmentCollection(),
      disable: () => false
    },
    {
      label: 'CANCEL',
      color: ButtonColor.TERTIARY,
      click: () => this.dialogRef.close()
    }
  ];


  constructor(
    private dialogService: DialogService,
    protected dialogRef: MatDialogRef<CreateEnrollmentCollectionDialogComponent>
  ) {
    this.dialogService.setDialogEventListeners(this.dialogRef).pipe(takeUntil(this.destroy$)).subscribe();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
