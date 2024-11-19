import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertType, ButtonColor, CheckboxChange, RadioChange } from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SearchTableColumn } from 'src/app/shared/search-table/search-table.model';
import { EMPTY, ERROR_MESSAGE, SUCCESS, SUCCESS_CODE } from 'src/app/core/constants';
import { PaginationResponse, ResponseError } from 'src/app/core/models/pagination-response.model';
import { FormService } from 'src/app/services/form-service/form.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';
import { ApiConfigService } from 'src/app/services/api-config.service';

@Component({
  selector: 'app-event-relationships',
  templateUrl: './event-relationships.component.html',
  styleUrls: ['./event-relationships.component.scss']
})
export class EventRelationshipsComponent implements OnInit, AfterViewInit {
  @Input()
  eventStageId: any;

  @Input()
  eventGroupId: any;

  @Input()
  eventTemplateId!: number;

  @Input()
  eventTemplateCommunityCode!: string;

  @Input()
  eventGroupTemplateId!: number;

  @Input()
  isTemplateEvent: boolean = false;

  @Input()
  disabled: boolean = false;

  private errorMessages = {};
  private destroy$ = new Subject<void>();

  buttonColor = ButtonColor;

  executeActionIf: string = 'ALL';
  tableId: string = 'Event Dependency Table';
  caption: string = EMPTY;

  executeActionIfNumber: number = 0;

  hasEventPrerequisiteDeadline: boolean = false;


  tableColumns: SearchTableColumn[] = [
    {
      key: 'dependentEventName',
      label: 'Event Name'
    },
    {
      key: 'dependentEventTypeName',
      label: 'Event Type'
    },
    {
      key: 'prerequisite',
      label: 'Prerequisite'
    }
  ];

  prerequisitedCol: number[] = [];

  eventTableDataSource: any[] = [];

  deadlineForm = this.fb.group({
    days: [0, Validators.required],
    hours: [0, Validators.required],
    minutes: [0, Validators.required]
  });

  constructor(
    private http: HttpClient,
    private toggleAlertService: ToggleAlertService,
    private fb: UntypedFormBuilder,
    private route: ActivatedRoute,
    private formService: FormService,
    private env: ApiConfigService
  ) { }

  private updateErrorMessages(responseErrors: ResponseError[]) {
    this.toggleAlertService.showResponseErrors(responseErrors);

    const additionalErrors = this.formService.prepareErrorObject(responseErrors);

    this.errorMessages = { ...this.errorMessages, ...additionalErrors };

    this.formService.setResponseErrors(responseErrors, this.deadlineForm);
  }


  ngOnInit(): void {
    this.getEventDependency();
  }

  ngAfterViewInit(): void {
    this.caption = Utils.generateCaptionMessage(this.tableColumns, this.tableId);
  }

  updateDeadlineValues(fromControlName: string, event: any) {
    const value = event?.target?.value;

    if (!!value) {
      this.deadlineForm.get(fromControlName)?.patchValue(Number(value));
    }
  }

  checkPrerequisited(i: number) {
    if (this.prerequisitedCol.includes(i)) {
      let index = this.prerequisitedCol.indexOf(i);
      this.prerequisitedCol.splice(index, 1);
    } else {
      this.prerequisitedCol.push(i);
      this.prerequisitedCol.sort();
    }
  }

  selectRadio(e: RadioChange) {
    this.executeActionIf = e.value;
    this.executeActionIfNumber = this.executeActionIf == 'OF' ? 1 : 0;
  }
  selectCustomRadio(e: any) {
    this.executeActionIfNumber = parseInt(e.value);
  }

  enableDeadLine(e: CheckboxChange) {
    this.hasEventPrerequisiteDeadline = !!e.checked;
    if (!e.checked) {
      this.deadlineForm.reset({ days: 0, hours: 0, minutes: 0 });
    }
  }

  getEventDependency() {
    const url = this.isTemplateEvent
      ? 'api/v1/event/template/availableEventDependencies/' + this.eventTemplateId
      : 'api/v1/event/availableEventDependencies/' + this.eventStageId

    this.http
      .get(this.env.getUrls().baseUrl + url)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          // res = JSON.parse(res.body);

          this.eventTableDataSource = res.data?.eventPrerequisites || [];
          this.executeActionIf = res.data?.executeActionIf;
          this.executeActionIfNumber = res.data?.executeActionIfNumber;
          this.hasEventPrerequisiteDeadline =
            res.data?.hasEventPrerequisiteDeadline;
          this.deadlineForm.patchValue(res.data?.eventDependentDeadline);

          this.prerequisitedCol = [];
          this.eventTableDataSource.map((data, i) => {
            if (data.prerequisite) {
              this.prerequisitedCol.push(i);
              this.prerequisitedCol.sort();
            }
          });
        },
        error: err => {
          console.log(err);
        }
      });
  }

  public setEventDependency(callback?: any) {
    const eventDependentDeadline = this.deadlineForm.getRawValue();
    Object.keys(eventDependentDeadline).forEach(key => {
      eventDependentDeadline[key] = parseInt(eventDependentDeadline[key]);
    });

    const eventPrerequisites = this.eventTableDataSource.map((data, i) => ({
      dependentEventStageId: data.dependentEventStageId,
      dependentEventName: null,
      prerequisite: this.prerequisitedCol.includes(i),
      reuseDependency: false
    }));

    const sendingBody = {
      communityCode: this.isTemplateEvent ? this.eventTemplateCommunityCode : this.route.snapshot.queryParams['client'],
      eventStageId: this.isTemplateEvent ? this.eventTemplateId : this.eventStageId,
      eventGroupId: this.isTemplateEvent ? this.eventGroupTemplateId : this.eventGroupId,
      ...(this.prerequisitedCol.length && {
        executeActionIf: this.executeActionIf,
        executeActionIfNumber: this.executeActionIfNumber,
        hasEventPrerequisiteDeadline: this.hasEventPrerequisiteDeadline,
        eventDependentDeadline: this.hasEventPrerequisiteDeadline
          ? eventDependentDeadline
          : null
      }),
      eventPrerequisites: eventPrerequisites
    };

    this.http.post<PaginationResponse<any>>(`${this.env.getUrls().baseUrl}api/v1/event${this.isTemplateEvent ? '/template' : ''}/prerequisites`, sendingBody)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: PaginationResponse<any>) => {

          if (Utils.isNotNull(res.errors) || !(res.statusCode === SUCCESS_CODE)) {
            this.updateErrorMessages(res.errors);
          } else {
            this.getEventDependency();

            this.toggleAlertService.showSuccessMessage("Event updated successfully.");

            if (callback) {
              callback();
            }
          }

        },
        error: err => {
          this.toggleAlertService.showError(EMPTY);
          console.log(err);
        }
      });
  }

  public getErrorMessage(controlName: string): string {
    return this.formService.getFormControlErrorMessage(this.deadlineForm, controlName, this.errorMessages)
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
