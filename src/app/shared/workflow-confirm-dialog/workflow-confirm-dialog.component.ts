import { Component, Inject, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonColor } from '@visa/vds-angular';
import { Subject, takeUntil } from 'rxjs';
import { DialogButton } from 'src/app/core/dialog/dialog.model';
import { ConfirmDialogComponent } from 'src/app/pages/programs/manage/program-event-group/create-edit-event-group/confirm-dialog/confirm-dialog.component';
import { CustomFormGroup, FormBuilder, FormService } from 'src/app/services/form-service/form.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { WorkflowConfirmDialogConfig, ConfirmPayload } from './workflow-confirm-dialog.model';
import { Utils } from 'src/app/services/utils';
import { DialogService } from 'src/app/services/dialog/dialog.service';

@Component({
  selector: 'app-workflow-confirm-dialog',
  templateUrl: './workflow-confirm-dialog.component.html',
  styleUrls: ['./workflow-confirm-dialog.component.scss']
})
export class WorkflowConfirmDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  protected form: CustomFormGroup<ConfirmPayload> = this.formBuilder.group<ConfirmPayload>(new ConfirmPayload());
  protected showLoader: boolean = false;

  protected dialogActions: DialogButton[] = [
    {
      label: 'Confirm',
      color: ButtonColor.PRIMARY,
      click: () => this.submit()
    },
    {
      label: 'Cancel',
      color: ButtonColor.SECONDARY,
      click: () => this.dialogRef.close()
    }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private viewContainerRef: ViewContainerRef,
    private dialogService: DialogService,
    protected formService: FormService,
    protected dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) protected dialogConfig: WorkflowConfirmDialogConfig
  ) {
    this.dialogService.setDialogEventListeners(this.dialogRef).pipe(takeUntil(this.destroy$)).subscribe();

    if (Utils.isNotNull(dialogConfig?.dialogActions)) {
      this.dialogActions = dialogConfig.dialogActions!;
    }
  }

  private submit() {
    const formValidationMap: Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null> = new Map();

    formValidationMap.set(this.form.controls.comment, [Validators.required]);

    if (this.formService.validate(formValidationMap)) {
      this.showLoader = true;


      this.dialogConfig?.confirm(this.form.value.comment!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: res => res && this.dialogRef.close(),
          error: err => this.showLoader = false
        });
    }
  }


  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }
}