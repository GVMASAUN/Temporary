import { Component, Inject, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ButtonColor } from '@visa/vds-angular';
import { EMPTY, SUCCESS_CODE } from 'src/app/core/constants';
import { DialogButton } from 'src/app/core/dialog/dialog.model';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { EventGroup } from 'src/app/pages/programs/event-group.model';
import { Event } from 'src/app/pages/programs/event.model';
import { FormService } from 'src/app/services/form-service/form.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';
import { CreateEditEventGroupComponent } from '../create-edit-event-group.component';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  form!: UntypedFormGroup;

  eventGroup!: EventGroup;
  event!: Event;

  callback!: any;
  submitCallback!: any;
  closeCallback!: any;

  dialogTitle!: string;
  isTemplateEventGroup: boolean = false;

  showLoader: boolean = false;

  dialogActions: DialogButton[] = [
    {
      label: 'Confirm',
      color: ButtonColor.PRIMARY,
      click: () => {
        this.submit();
      }
    },
    {
      label: 'Cancel',
      color: ButtonColor.SECONDARY,
      click: () => {
        this.close()
      }
    }
  ];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private formService: FormService,
    private toggleAlertService: ToggleAlertService,
    private dialog: MatDialog,
    private viewContainerRef:ViewContainerRef,
    private dialogService: DialogService,
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any
  ) {
    this.dialogService.setDialogEventListeners(
      this.dialogRef,
      () => { this.close(); }
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnInit(): void {
    this.initForm();
    this.mapDialogConfigData();
  }

  private initForm() {
    this.form = this.formBuilder.group({ comment: [EMPTY] });
  }

  private mapDialogConfigData() {
    const dialogData = this.dialogConfig;

    this.eventGroup = dialogData?.eventGroup;
    this.event = dialogData?.event;

    this.dialogTitle = dialogData?.dialogTitle;
    this.callback = dialogData?.callback;
    this.submitCallback = dialogData?.submitCallback;
    this.closeCallback = dialogData?.closeCallback;
    this.isTemplateEventGroup = dialogData?.isTemplateEventGroup;
  }


  private validate() {
    const control = this.form.get('comment');

    control?.setValidators([Validators.required]);
    control?.markAsTouched();
    control?.updateValueAndValidity({ emitEvent: false });

    return control?.valid;
  }

  private submit() {
    if (this.validate()) {
      this.showLoader = true;

      const comment = this.form.get('comment')?.value;

      if (this.callback) {
        let callback;

        if (this.event) {
          callback = this.callback(this.eventGroup, this.event.eventStageId, comment);
        } else {
          callback = this.callback(this.eventGroup, comment);
        }

        callback
          .subscribe({
            next: (response: PaginationResponse<EventGroup>) => {
              if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
                this.toggleAlertService.showSuccessMessage(
                  this.event
                    ? `Event updated successfully.`
                    : `Event Group updated successfully.`
                )

                this.close(true);

              } else {
                this.showLoader = false;

                this.toggleAlertService.showResponseErrors(response.errors);
              }
            },
            error: (err: { error: any; }) => {
              this.showLoader = false;
              console.log(err);
            }
          });
      }

      if (this.submitCallback) {
        this.submitCallback(comment);
      }
    }
  }

  getErrorMessage(controlName: string) {
    return this.formService.getFormControlErrorMessage(this.form, controlName);
  }

  close(submitRequest = false) {
    if (this.closeCallback) {
      this.closeCallback(submitRequest);
      return;
    }

    if (!!this.isTemplateEventGroup) {
      this.dialogRef.close({ reloadEventGroupTemplate: submitRequest });
      this.dialog.closeAll();

    } else {
      this.dialogRef.close();
      this.dialog.closeAll();

      
      this.dialog.open(
        CreateEditEventGroupComponent,
        {
          hasBackdrop: true,
          disableClose: true,
          width: '1250px',
          ariaLabel: 'create-edit-event-group-dialog'
        }
      );
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }

}
