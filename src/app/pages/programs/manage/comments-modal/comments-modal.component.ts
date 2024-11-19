import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { cloneDeep } from 'lodash';
import { DateTimeFormat, EMPTY, SUCCESS_CODE } from 'src/app/core/constants';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { HttpService } from 'src/app/services/http/http.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';
import { CreateEditEventGroupByTemplateComponent } from '../program-event-group/create-edit-event-group-by-template/create-edit-event-group-by-template.component';
import { CreateEditEventGroupComponent } from '../program-event-group/create-edit-event-group/create-edit-event-group.component';
import { CreateEditEventComponent } from '../program-event-group/create-edit-event/create-edit-event.component';

@Component({
  selector: 'app-comments-modal',
  templateUrl: './comments-modal.component.html',
  styleUrls: ['./comments-modal.component.scss']
})
export class CommentsModalComponent implements OnInit {
  DateFormat = DateTimeFormat;

  isEventGroup: boolean = false;
  isEventGroupTemplate: boolean = false;

  canSaveComments: boolean = true;

  eventId: string = EMPTY;
  communityCode: string = this.route.snapshot.queryParams['client'];
  title: string = EMPTY;

  parentEntityId: number = 0;
  workflowVersionNumber: number = 1;

  parentDialogData: any;

  comments: any[] = [];

  @HostListener("window:keyup.esc")
  onKeyUp(): void {
    this.close();
  }

  constructor(
    private route: ActivatedRoute,
    private http: HttpService,
    private alertService: ToggleAlertService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CommentsModalComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any
  ) { }

  ngOnInit(): void {
    const dialogData = this.dialogConfig;

    this.isEventGroup = dialogData.isEventGroup;
    this.isEventGroupTemplate = !!dialogData?.isEventGroupTemplate;
    this.title = dialogData.title;
    this.canSaveComments = dialogData?.saveComments;
    this.workflowVersionNumber = dialogData.workflowVersionNumber;
    this.parentDialogData = cloneDeep(dialogData.parentDialogData);

    if (this.isEventGroup) {
      this.eventId = JSON.stringify(dialogData.eventGroupId);
      this.parentEntityId = 0;

      this.getEventGroup();
    } else {
      this.eventId = JSON.stringify(dialogData.eventStageId);
      this.parentEntityId = dialogData.eventGroupId;

      this.getEvent();
    }
  }

  getEventGroup() {
    const sendingParams = {
      communityCode: this.communityCode,
      workflowVersion: this.workflowVersionNumber
    };
    this.http
      .get(
        'api/v1/message/listEventGroupMessages/' + this.eventId,
        sendingParams
      )
      .subscribe({
        next: (res: any) => {
          const response: PaginationResponse<any> = JSON.parse(res.body!);

          if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
            this.comments = response.data;
          } else {
            this.alertService.showResponseErrors(response.errors);
          }
        },
        error: err => {
          console.log(err);
        }
      });
  }

  getEvent() {
    const sendingParams = {
      communityCode: this.communityCode,
      workflowVersion: this.workflowVersionNumber
    };
    this.http
      .get('api/v1/message/listEventMessages/' + this.eventId, sendingParams)
      .subscribe({
        next: (res: any) => {
          const response: PaginationResponse<any> = JSON.parse(res.body!);

          if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
            this.comments = response.data;
          } else {
            this.alertService.showResponseErrors(response.errors);
          }
        },
        error: err => {
          console.log(err);
        }
      });
  }

  postEventGroup(comment: string) {
    const sendingParam = {
      communityCode: this.communityCode,
      entityId: this.eventId,
      parentEntityId: this.parentEntityId,
      workflowVersionNumber: this.workflowVersionNumber,
      comment: comment
    };

    this.http.post('api/v1/message/eventGroupMessage', sendingParam).subscribe({
      next: res => {
        const response: PaginationResponse<any> = JSON.parse(res.body!);

        if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
          this.getEventGroup();

        } else {
          this.alertService.showResponseErrors(response.errors);
        }
      },
      error: err => {
        console.log(err);
      }
    });
  }

  postEvent(comment: string) {
    const sendingParam = {
      communityCode: this.communityCode,
      entityId: this.eventId,
      parentEntityId: this.parentEntityId,
      workflowVersionNumber: this.workflowVersionNumber,
      comment: comment
    };

    this.http.post('api/v1/message/eventMessage', sendingParam).subscribe({
      next: res => {
        const response: PaginationResponse<any> = JSON.parse(res.body!);

        if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
          this.getEvent();
        } else {
          this.alertService.showResponseErrors(response.errors);
        }
      },
      error: err => {
        console.log(err);
      }
    });
  }

  formatDate(date: Date | string, format: DateTimeFormat): string {
    return Utils.convertUTCDateTimeToLocalDateTime(date, format);
  }

  getTimeZone(): string {
    return Utils.getTimeZone();
  }

  saveComment(comment: string) {
    this.isEventGroup ? this.postEventGroup(comment) : this.postEvent(comment);
  }

  close() {
    this.dialogRef.close();
  }
}
