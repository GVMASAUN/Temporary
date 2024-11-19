import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonColor } from '@visa/vds-angular';
import { DateTimeFormat, EMPTY, SUCCESS_CODE } from 'src/app/core/constants';
import { DialogButton } from 'src/app/core/dialog/dialog.model';
import { ButtonDirection } from 'src/app/core/models/dialog-button-direction.model';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { CustomFormGroup, CustomValidator, FormBuilder, FormService } from 'src/app/services/form-service/form.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { DateUtils } from 'src/app/services/util/dateUtils';
import { Utils } from 'src/app/services/utils';
import { CommentModalConfig, CommentModel, EntityType } from './comments-modal.model';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-comments-modal',
  templateUrl: './comments-modal.component.html',
  styleUrls: ['./comments-modal.component.scss']
})
export class CommentsModalComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  form!: CustomFormGroup<{
    comment: string
  }>;

  DateFormat = DateTimeFormat;
  EntityType = EntityType;

  loading: boolean = false;

  buttonDirection = ButtonDirection.RIGHT

  comments: CommentModel[] = [];

  buttons: DialogButton[] = [
    {
      label: 'DONE',
      color: ButtonColor.PRIMARY,
      click: () => {
        this.close();
      }
    }
  ]

  constructor(
    private alertService: ToggleAlertService,
    private formBuilder: FormBuilder,
    private formService: FormService,
    private dialogRef: MatDialogRef<CommentsModalComponent>,
    private dialogService: DialogService,
    @Inject(MAT_DIALOG_DATA) public dialogConfig: CommentModalConfig
  ) {
    this.dialogService.setDialogEventListeners(
      this.dialogRef,
      () => { this.close(); }
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  private initForm(): void {
    this.form = this.formBuilder.group({ comment: [EMPTY] });
  }

  private validate(): boolean {
    const control = this.form.controls.comment;

    control?.setValidators([Validators.required, CustomValidator.noWhiteSpace]);
    control?.markAsTouched();
    control?.updateValueAndValidity({ emitEvent: false });

    return control?.valid!;
  }

  private getMessages(): void {
    this.loading = true;

    this.dialogConfig?.callback
      .subscribe({
        next: (response: PaginationResponse<Array<CommentModel>>) => {
          this.loading = false;

          this.form.reset();

          if (response.statusCode === SUCCESS_CODE && Utils.isNull(response.errors)) {

            this.comments = response.data;
          } else {

            this.alertService.showResponseErrors(response.errors);
          }
        },
        error: (err: any) => {
          console.log(err);
          this.loading = false;
        }
      });
  }

  private postMessage(comment: string): void {
    this.loading = true;

    if (this.dialogConfig?.onSaveCallback) {

      this.dialogConfig?.onSaveCallback(comment)
        .subscribe({
          next: (response: PaginationResponse<any>) => {
            this.loading = false;

            if (response.statusCode === SUCCESS_CODE && Utils.isNull(response.errors)) {
              this.formService.clearFormControlValidators(this.form);

              this.getMessages();
              this.alertService.showSuccessMessage("Comment added successfully.");
            } else {

              this.alertService.showResponseErrors(response.errors);
            }
          },
          error: (err: any) => {
            console.log(err);
            this.loading = false;
          }
        });
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.getMessages();
  }

  getFormatDate(date: Date | string, format: DateTimeFormat): string {
    return DateUtils.convertUTCDateTimeToLocalDateTime(date, format);
  }

  getTimeZone(): string {
    return DateUtils.getTimeZone();
  }

  getErrorMessage(control: AbstractControl): string {
    return this.formService.getFormControlErrorMessage(this.form, control);
  }

  saveComment(): void {
    if (this.validate()) {
      const comment = this.form.controls.comment.value;

      if (comment) {
        this.postMessage(comment);
      }
    }
  }

  close(): void {
    this.dialogConfig?.onCloseCallback(this.dialogRef);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

