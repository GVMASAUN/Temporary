import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonColor, TabsOrientation } from '@visa/vds-angular';
import { Observable, Subject, Subscription, merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CONFIRM_MESSAGE, EMPTY, SUCCESS_CODE, WorkFlowAction } from 'src/app/core/constants';
import { DialogComponent } from 'src/app/core/dialog/dialog.component';
import { DialogConfig } from 'src/app/core/dialog/dialog.model';
import { Mode } from 'src/app/core/models/mode.model';
import { PaginationResponse, ResponseError } from 'src/app/core/models/pagination-response.model';
import { StatusCode } from 'src/app/core/models/status.model';
import { UserRole } from 'src/app/core/models/user.model';
import { EventGroupStep } from 'src/app/pages/programs/event-group.model';
import { ConfirmDialogComponent } from 'src/app/pages/programs/manage/program-event-group/create-edit-event-group/confirm-dialog/confirm-dialog.component';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { EventGroupTemplateService } from 'src/app/services/event-group-template.service';
import { CustomFormGroup, FormBuilder } from 'src/app/services/form-service/form.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { EventActionService } from 'src/app/services/program/event-action/event-action.service';
import { EventService } from 'src/app/services/program/event/event.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';
import { EventGroupTemplate } from '../../event-group-template.model';
import { EventGroupTemplateBasicsComponent } from '../../shared/event-group-template-basics/event-group-template-basics.component';

@Component({
  selector: 'app-event-group-template-manage',
  templateUrl: './event-group-template-manage.component.html',
  styleUrls: ['./event-group-template-manage.component.scss']
})
export class EventGroupTemplateManageComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(EventGroupTemplateBasicsComponent)
  eventGroupTemplateBasicsComponent!: EventGroupTemplateBasicsComponent;

  private destroy$ = new Subject<void>();

  TabsOrientation = TabsOrientation;
  ButtonColor = ButtonColor;
  EventGroupStep = EventGroupStep;
  StatusCode = StatusCode;

  form: CustomFormGroup<EventGroupTemplate> = this.formBuilder.group(new EventGroupTemplate());


  mode = Mode.Manage;

  selectedTabIndex: number = 0;
  currentUserId: any;
  userRole!: UserRole;
  confirmDialogRef!: MatDialogRef<ConfirmDialogComponent>;

  initialized: boolean = true;

  tabs: string[] = [
    EventGroupStep.BASICS,
    EventGroupStep.EVENTS
  ];

  subscriptions: Subscription[] = [];

  readonly viewName = "event-group-template-manage";

  getTabId: Function = this.functionService.getTabId;
  getTabLabelledById: Function = this.functionService.getTabLabelledById;

  get eventGroupTemplate(): EventGroupTemplate {
    return this.form.getRawValue() as EventGroupTemplate;
  }

  get editable(): boolean {
    return this.eventGroupTemplate.eventGroupStatusCode !== StatusCode.PENDING_REVIEW
      && this.eventGroupTemplate.eventGroupStatusCode !== StatusCode.ACTIVE
      && this.eventGroupTemplate.eventGroupStatusCode !== StatusCode.INACTIVE
    // && this.eventGroupTemplate.eventGroupStatusCode !== StatusCode.PENDING_DEACTIVATION;
  }

  get showCloseButton(): boolean {
    return this.selectedTabIndex !== this.tabs.indexOf(EventGroupStep.BASICS) || !this.editable;
  }

  get disabledApproveOrReject(): boolean {
    return (
      (
        (this.mode !== Mode.Manage) ||
        this.eventGroupTemplate?.modifiedUserId === this.currentUserId ||
        (this.eventGroupTemplate.eventGroupStatusCode === StatusCode.PENDING_DEACTIVATION_REVIEW && this.userRole === UserRole.CLIENT_REVIEWER) ||
        this.userRole === UserRole.CLIENT_READ_ONLY ||
        this.userRole === UserRole.CLIENT_NO_RESTRICTED_FIELDS ||
        this.userRole === UserRole.CLIENT
      )
    );
  }

  constructor(
    private navStatusService: NavStatusService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private toggleAlertService: ToggleAlertService,
    private eventGroupTemplateService: EventGroupTemplateService,
    private eventService: EventService,
    private eventActionService: EventActionService,
    private authService: AuthorizationService,
    private functionService: FunctionsService,
    private viewContainerRef: ViewContainerRef,
    private dialog: MatDialog

  ) {
    this.currentUserId = this.authService.getUserId();
    this.userRole = this.authService.getUserRole();

    merge(
      this.eventService.reloadEventObservable,
      this.eventActionService.reloadEventActionObservable
    ).pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (!!res) {
          this.ngOnInit();
        }
      });
  }

  private mapResponse(response: any) {
    this.form.patchValue(response);
  }

  private init() {
    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const stageId = params.get('id');

      if (stageId) {
        const id = parseInt(stageId, 10);

        this.eventGroupTemplateService.getEventGroupTemplate(id)
          .subscribe(response => {
            this.mapResponse(response.data)
          }
          );
      }
    });
  }

  private setAlertMessage(isDelete: boolean = false) {
    this.toggleAlertService.showSuccessMessage(`Event Group Template ${isDelete ? 'deleted' : 'updated'} successfully.`);
  }


  private setErrorMessages(responseErrors: ResponseError[]) {
    this.toggleAlertService.showResponseErrors(responseErrors);

    this.eventGroupTemplateService.updateErrorMessages(responseErrors, this.form);
  }


  private navigateToTemplateList() {
    this.router.navigate(['event-group-template'], {
      queryParamsHandling: 'merge'
    });
  }


  private openConfirmDialog(workflow: WorkFlowAction, submitCallback: Function) {
    // this.dialogService.close({ cancel: true });

    let title = EMPTY;

    if (workflow === WorkFlowAction.REJECT) {
      title = 'Rejection Comment';
    }
    if (workflow === WorkFlowAction.REJECT_DEACTIVATION) {
      title = 'Reason for Deactivation Rejection';
    }
    if (workflow === WorkFlowAction.SUBMIT_FOR_DEACTIVATE || workflow === WorkFlowAction.DEACTIVATE) {
      title = 'Reason for Deactivation'
    }



    this.confirmDialogRef = this.dialog.open(
      ConfirmDialogComponent,
      {
        hasBackdrop: true, disableClose: true,
        ariaLabel: 'confirm-dialog',
        data: {
          dialogTitle: title,
          submitCallback: submitCallback,
          eventGroup: this.eventGroupTemplate,
          isTemplateEventGroup: true,
          eventGroupTemplateId: this.eventGroupTemplate.eventGroupTemplateId
        },
      })
  }


  private performStatusTransition(callback: Observable<PaginationResponse<EventGroupTemplate>>, afterSubmitCallback?: Function) {
    if (callback) {
      callback.subscribe({
        next: response => {
          if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
            if (afterSubmitCallback) {
              afterSubmitCallback();
            }

            this.setAlertMessage();
            this.ngOnInit();
          } else {
            this.setErrorMessages(response.errors);
          }
        },
        error: err => {
          console.log(err.error);
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.navStatusService.setOverlayStatus(true);
  }


  ngOnInit(): void {
    this.init();
  }

  hideTab(step: EventGroupStep): boolean {
    return this.selectedTabIndex !== this.tabs.indexOf(step);
  }


  deleteTemplate() {
    // this.dialogService.close();

    const dialogConfig: DialogConfig<any> = {
      title: CONFIRM_MESSAGE,
      buttons: [
        {
          label: 'Delete',
          color: ButtonColor.PRIMARY,
          click: () => {
            this.eventGroupTemplateService.deleteEventGroupTemplate(this.eventGroupTemplate.eventGroupTemplateId!)
              .subscribe({
                next: response => {
                  deleteDialog.close();

                  this.setAlertMessage(true);
                },
                error: error => {

                }
              })
          }
        },
        {
          label: 'Cancel',
          color: ButtonColor.SECONDARY,
          click: () => {
            deleteDialog.close();
          }
        },
      ],
    }

    const deleteDialog = this.dialog.open(
      DialogComponent,
      {
        hasBackdrop: true, disableClose: true,
        ariaLabel: 'delete-dialog',
        data: dialogConfig
      }
    );

  }


  handleSubmit(saveAndExit: boolean = false) {
    const isValid = this.eventGroupTemplateBasicsComponent.validate();

    if (isValid) {
      this.eventGroupTemplateService.updateEventGroupTemplate(
        this.eventGroupTemplate.eventGroupTemplateId,
        this.form.getRawValue()
      ).subscribe({
        next: response => {
          if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
            this.setAlertMessage();

            if (saveAndExit) {
              this.navigateToTemplateList();
            } else {
              this.init();
            }

          } else {
            this.setErrorMessages(response.errors);
          }
        },
        error: err => {
          console.log(err);
        }
      });
    } else {
      this.toggleAlertService.showError();
    }
  }


  handleWorkflowChange(workFlowAction: WorkFlowAction) {
    if (WorkFlowAction.SUBMIT_FOR_APPROVAL === workFlowAction) {
      this.performStatusTransition(this.eventGroupTemplateService.summitEventGroup(this.eventGroupTemplate));
    } else if (WorkFlowAction.APPROVE === workFlowAction) {
      this.performStatusTransition(this.eventGroupTemplateService.approveEventGroup(this.eventGroupTemplate));
    } else if (WorkFlowAction.PUBLISH === workFlowAction) {
      this.performStatusTransition(this.eventGroupTemplateService.publishEventGroup(this.eventGroupTemplate));
    } else if (WorkFlowAction.APPROVE_DEACTIVATION === workFlowAction) {
      this.performStatusTransition(this.eventGroupTemplateService.approveEventGroupDeactivation(this.eventGroupTemplate));
    } else if (WorkFlowAction.REJECT === workFlowAction) {
      this.openConfirmDialog(workFlowAction, (comment: string) =>
        this.performStatusTransition(
          this.eventGroupTemplateService.rejectEventGroup(
            this.eventGroupTemplate,
            comment
          ),
          () => this.confirmDialogRef.close()
        )
      );
    } else if (WorkFlowAction.REJECT_DEACTIVATION === workFlowAction) {
      this.openConfirmDialog(
        workFlowAction,
        (comment: string) => this.performStatusTransition(
          this.eventGroupTemplateService.rejectEventGroupDeactivation(
            this.eventGroupTemplate,
            comment
          ),
          () => this.confirmDialogRef.close()
        )
      );
    } else if (WorkFlowAction.SUBMIT_FOR_DEACTIVATE === workFlowAction || WorkFlowAction.DEACTIVATE === workFlowAction) {
      this.openConfirmDialog(
        workFlowAction,
        (comment: string) => this.performStatusTransition(
          this.eventGroupTemplateService.deactivateEventGroup(
            this.eventGroupTemplate,
            comment
          ),
          () => this.confirmDialogRef.close()
        )
      );
    }

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.navStatusService.setOverlayStatus(false);

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    )
  }
}
