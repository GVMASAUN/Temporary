import { Component, HostListener, Inject, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { DateTimeFormat, EMPTY, SUCCESS_CODE } from 'src/app/core/constants';
import { EventGroupTemplateService } from 'src/app/services/event-group-template.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';
import { EventGroupTemplateMessage } from '../../event-group-template.model';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-comment-modal',
  templateUrl: './comment-modal.component.html',
  styleUrls: ['./comment-modal.component.scss']
})
export class CommentModalComponent implements OnInit, OnDestroy {
  DateFormat = DateTimeFormat;

  eventGroupTemplateId!: number;
  eventGroupTemplateCommunityGroup!: string;

  title: string = EMPTY;

  comments: EventGroupTemplateMessage[] = [];

  @HostListener("window:keyup.esc")
  onKeyUp(): void {
    this.close();
  }

  constructor(
    private eventGroupTemplateService: EventGroupTemplateService,
    private alertService: ToggleAlertService,
    private viewContainerRef: ViewContainerRef,
    private dialogRef: MatDialogRef<CommentModalComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any
  ) { }

  ngOnInit(): void {
    this.init();
  }

  formatDate(date: Date | string | null, format: DateTimeFormat): string {
    if (date) {
      return Utils.convertUTCDateTimeToLocalDateTime(date, format);
    }

    return EMPTY;
  }

  getTimeZone(): string {
    return Utils.getTimeZone();
  }

  saveComment(comment: string) {
    const sendingParam = {
      communityCode: this.eventGroupTemplateCommunityGroup,
      entityId: this.eventGroupTemplateId,
      comment: comment
    };

    this.eventGroupTemplateService.saveEventGroupTemplateComment(sendingParam)
      .subscribe({
        next: response => {
          if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
            this.init();
          } else {
            this.alertService.showResponseErrors(response.errors);
          }
        },
        error: err => {
          console.log(err);
        }
      });
  }

  close() {
    this.dialogRef.close();
  }


  private init() {
    const dialogConfig = this.dialogConfig;

    if (dialogConfig) {
      this.eventGroupTemplateId = dialogConfig?.eventGroupTemplateId;
      this.title = dialogConfig?.title;
      this.eventGroupTemplateCommunityGroup = dialogConfig?.eventGroupTemplateCommunityGroup;
    }

    if (this.eventGroupTemplateId) {
      this.eventGroupTemplateService
        .getEventGroupTemplateMessages(this.eventGroupTemplateId, this.eventGroupTemplateCommunityGroup)
        .subscribe({
          next: response => {
            if (response.success && Utils.isNull(response.errors)) {
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
  }


  ngOnDestroy(): void {
    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    )
  }
}
