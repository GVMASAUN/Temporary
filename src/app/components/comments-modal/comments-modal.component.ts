import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { ButtonColor } from '@visa/vds-angular';
import { DateTimeFormat, EMPTY, SUCCESS_CODE } from 'src/app/core/constants';
import { DialogButton } from 'src/app/core/dialog/dialog.model';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';
import { CommentModalConfig, EntityType, CommentModel } from './comments-modal.model';
import { FormGroup } from '@angular/forms';
import { FormBuilder } from 'src/app/services/form-service/form.service';
import { ButtonDirection } from 'src/app/core/models/dialog-button-direction.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-comments-modal',
  templateUrl: './comments-modal.component.html',
  styleUrls: ['./comments-modal.component.scss']
})
export class CommentsModalComponent implements OnInit {
  form!: FormGroup;

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

  @HostListener("window:keyup.esc")
  onKeyUp(): void {
    this.close();
  }

  constructor(
    private alertService: ToggleAlertService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<CommentsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogConfig: CommentModalConfig
  ) { }

  private initForm() {
    this.form = this.formBuilder.group({ comment: [EMPTY] });
  }

  private getMessages() {
    this.loading = true;

    this.dialogConfig?.callback()
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

  private postMessage(comment: string) {
    this.loading = true;

    if (this.dialogConfig?.onSaveCallback) {

      this.dialogConfig?.onSaveCallback(comment)
        .subscribe({
          next: (response: PaginationResponse<any>) => {
            this.loading = false;

            if (response.statusCode === SUCCESS_CODE && Utils.isNull(response.errors)) {

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

  formatDate(date: Date | string, format: DateTimeFormat): string {
    return Utils.convertUTCDateTimeToLocalDateTime(date, format);
  }

  getTimeZone(): string {
    return Utils.getTimeZone();
  }

  saveComment() {
    const comment = this.form?.get('comment')?.value;
    if (comment) {
      this.postMessage(comment);
    }
  }

  close() {
    this.dialogConfig?.onCloseCallback(this.dialogRef);
  }
}

