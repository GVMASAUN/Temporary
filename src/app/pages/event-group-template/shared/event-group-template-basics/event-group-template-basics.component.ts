import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BadgeType, ButtonColor, CALENDAR_PLACEMENT } from '@visa/vds-angular';
import { EMPTY } from 'rxjs';
import { DateTimeFormat, VisaIcon, WorkFlowAction } from 'src/app/core/constants';
import { Mode } from 'src/app/core/models/mode.model';
import { Option } from 'src/app/core/models/option.model';
import { STATUS_BADGE_TYPE, STATUS_DESC, StatusCode } from 'src/app/core/models/status.model';
import { UserRole } from 'src/app/core/models/user.model';
import { DialogMode } from 'src/app/pages/programs/program.model';
import { EventGroupTemplateService } from 'src/app/services/event-group-template.service';
import { CustomFormGroup, CustomValidator, FormService } from 'src/app/services/form-service/form.service';
import { DateUtils } from 'src/app/services/util/dateUtils';
import { Utils } from 'src/app/services/utils';
import { CommentsModalComponent } from 'src/app/shared/comments-modal/comments-modal.component';
import { EntityType } from 'src/app/shared/comments-modal/comments-modal.model';
import { EventGroupTemplate } from '../../event-group-template.model';

@Component({
  selector: 'app-event-group-template-basics',
  templateUrl: './event-group-template-basics.component.html',
  styleUrls: ['./event-group-template-basics.component.scss']
})
export class EventGroupTemplateBasicsComponent implements OnInit, AfterViewInit {
  @Input()
  form!: CustomFormGroup<EventGroupTemplate>;

  @Input()
  mode: Mode = Mode.Create;

  @Input()
  disabled: boolean = false;

  @Input()
  disabledApproveOrReject: boolean = false;

  @Input()
  editable: boolean = false;

  @Input()
  userRole!: UserRole;

  @Input()
  currentUserId!: string;

  @Output()
  workflowChangeEmitter: EventEmitter<WorkFlowAction> = new EventEmitter();

  DateFormat = DateTimeFormat;
  BadgeType = BadgeType;
  ButtonColor = ButtonColor;
  DialogMode = DialogMode
  StatusCode = StatusCode;
  WorkFlowAction = WorkFlowAction;
  UserRole = UserRole;
  VisaIcon = VisaIcon;
  Mode = Mode;

  CALENDAR_PLACEMENT = CALENDAR_PLACEMENT;
  STATUS_DESC = STATUS_DESC;
  STATUS_BADGE_TYPE = STATUS_BADGE_TYPE;


  timeZone = DateUtils.getTimeZone();
  automationTypes: Option[] = [];

  get disableSubmitForApproval(): boolean {
    return (
      (this.userRole === UserRole.CLIENT_READ_ONLY) ||
      this.disabled ||
      Utils.isNull(this.eventGroupTemplate.eventTemplateList) ||
      !this.eventGroupTemplate?.eventTemplateList?.some(evnt => Utils.isNotNull(evnt.eventActions))
    )
  }

  get eventGroupTemplate(): EventGroupTemplate {
    return this.form.getRawValue() as EventGroupTemplate;
  }


  constructor(
    private eventGroupTemplateService: EventGroupTemplateService,
    private formService: FormService,
    private dialog: MatDialog,
  ) { }

  private registerOnChangeListeners() {
  }

  private setAutomatonTypes() {
    this.automationTypes = this.eventGroupTemplateService.getAutomationTypes();
  }

  private init() {
    this.setAutomatonTypes();
  }

  ngOnInit(): void {
    this.registerOnChangeListeners();

    this.init();
  }

  ngAfterViewInit(): void {
    this.formService.clearFormControlValidators(this.form);
  }

  getErrorMessage(control: AbstractControl): string {
    return this.eventGroupTemplateService.getErrorMessage(this.form, control);
  }

  handleTimeChange(event: any, formControlName: string) {
    this.form.get(formControlName)?.patchValue(event?.target?.value || EMPTY);
  }

  validate(): boolean {
    const formValidationMap = this.getFormValidationMap();
    const controls: AbstractControl[] = [];

    const formControls = Array.from(formValidationMap.keys());

    formControls.map(control => {
      if (control) {
        control?.setValidators(formValidationMap.get(control) ?? []);
        control?.markAsTouched();
        control?.updateValueAndValidity({ emitEvent: false });
        controls?.push(control);
      }
    })

    if (controls.reduce((acc, val) => acc && !val.invalid, true)) {
      return true;
    }

    return false;
  }

  showComments() {
    const eventGroupTemplateId = this.eventGroupTemplate.eventGroupTemplateId!;
    const params: any = {
      communityCode: this.eventGroupTemplate.communityCode
    }

    const onSaveCallback = (comment: string) => {

      const params: any = {
        communityCode: this.eventGroupTemplate.communityCode,
        entityId: this.eventGroupTemplate.eventGroupTemplateId,
        comment: comment
      }

      return this.eventGroupTemplateService.postEventGroupTemplateMessage(params);
    }

    const onCloseCallback = (dialogRef: MatDialogRef<CommentsModalComponent>) => {
      dialogRef.close();
    }

    this.dialog.open(
      CommentsModalComponent, {
      hasBackdrop: true,
      disableClose: true,
      ariaLabel: 'comment-modal-dialog',
      data: {
        onSaveCallback: onSaveCallback,
        onCloseCallback: onCloseCallback,
        callback: this.eventGroupTemplateService.getEventGroupTemplateMessages(eventGroupTemplateId, params),
        entityType: EntityType.EVENT_GROUP_TEMPLATE,
        dialogTitle: this.eventGroupTemplate.eventGroupName,
        saveComments: true
      }
    });
  }

  private getFormValidationMap(): Map<AbstractControl, ValidatorFn | Array<ValidatorFn> | null> {
    const formValidationMap = new Map<AbstractControl, ValidatorFn | Array<ValidatorFn> | null>();

    formValidationMap.set(this.form.controls.eventGroupName,
      [Validators.required, CustomValidator.noWhiteSpace]
    );


    formValidationMap.set(this.form.controls.eventGroupType,
      [Validators.required]
    );

    formValidationMap.set(this.form.controls.workflowType,
      [Validators.required]
    );


    return formValidationMap;
  }

}
