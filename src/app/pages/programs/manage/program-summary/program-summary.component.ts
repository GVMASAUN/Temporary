import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AccordionComponent, TabsOrientation } from '@visa/vds-angular';
import { Subject, merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SUCCESS_CODE, VisaImage } from 'src/app/core/constants';
import { Mode } from 'src/app/core/models/mode.model';
import { StatusCode } from 'src/app/core/models/status.model';
import { UserRole } from 'src/app/core/models/user.model';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { EventActionService } from 'src/app/services/program/event-action/event-action.service';
import { EventGroupService } from 'src/app/services/program/event-group/event-group.service';
import { EventService } from 'src/app/services/program/event/event.service';
import { ProgramService } from 'src/app/services/program/program.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';
import { EventGroup, EventGroupType } from '../../event-group.model';
import { DialogMode, Program } from '../../program.model';
import { EventGroupSummaryComponent } from '../program-event-group/create-edit-event-group/event-group-summary/event-group-summary.component';

@Component({
  selector: 'app-program-summary',
  templateUrl: './program-summary.component.html',
  styleUrls: ['./program-summary.component.scss']
})
export class ProgramSummaryComponent implements OnInit, OnDestroy {
  @Input()
  mode!: Mode;

  @Input()
  form!: UntypedFormGroup;

  @Input()
  editable: boolean = true;

  @ViewChildren(AccordionComponent)
  accordions!: QueryList<AccordionComponent>;

  @ViewChildren(EventGroupSummaryComponent)
  eventGroupSummaryComponents!: QueryList<EventGroupSummaryComponent>;

  TabsOrientation = TabsOrientation;
  EventGroupType = EventGroupType;
  DialogMode = DialogMode;
  VisaImage = VisaImage;

  private destroy$ = new Subject<void>();

  selectedTabIndex: number = 0;

  selectedEventGroupType: EventGroupType = EventGroupType.UNPUBLISHED;

  programSummary!: Program;
  userRole!: UserRole;

  isEditableEventGroup(eventGroup: EventGroup): boolean {
    return (
      (eventGroup?.eventGroupStatusCode !== StatusCode.PENDING_REVIEW) &&
      (eventGroup?.eventGroupStatusCode !== StatusCode.PENDING_DEACTIVATION_REVIEW)
    );
  }
  constructor(
    private formBuilder: UntypedFormBuilder,
    private programService: ProgramService,
    private eventService: EventService,
    private authorizationService: AuthorizationService,
    private functionService: FunctionsService,
    private toggleAlertService: ToggleAlertService,
    private eventGroupService: EventGroupService,
    private eventActionService: EventActionService
  ) {
    this.userRole = this.authorizationService.getUserRole();

    merge(
      this.eventGroupService.reloadEventGroupObservable,
      this.eventService.reloadEventObservable,
      this.eventActionService.reloadEventActionObservable
    ).pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (!!res) {
          this.ngOnInit();
        }
      });


  }

  ngOnInit(): void {
    this.setProgram(this.selectedEventGroupType);
  }

  private setProgram(eventGroupType: EventGroupType) {
    const entity = this.form.getRawValue() as Program;

    let isPublished: boolean = false;

    if (eventGroupType === EventGroupType.UNPUBLISHED) {
      isPublished = false;
    } else {
      isPublished = true;
    }

    this.programService.getProgramSummary(entity.programStageId!, isPublished)
      .subscribe(
        {
          next: response => {
            if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
              this.programSummary = response.data;
            } else {
              this.toggleAlertService.showResponseErrors(response.errors);
            }
          },
          error: err => {
            console.log(err)
          }
        });
  }

  getEventGroupForm(eventGroupDetails: EventGroup) {
    if (eventGroupDetails) {
      const fromGroup = this.formBuilder.group(new EventGroup());

      fromGroup.patchValue(eventGroupDetails);

      return fromGroup;
    }

    return this.formBuilder.group({});
  }

  getSortedEventGroups() {
    const groups = this.programSummary.eventGroupList || [];

    return groups.sort((a, b) => a.eventGroupName!.localeCompare(b.eventGroupName!));
  }

  handleEventGroupChange(event: any) {
    if (event) {
      this.selectedEventGroupType = event.target.value;
    }

    this.setProgram(this.selectedEventGroupType);

  }

  expandAccordionItems(expand: boolean = true) {
    this.functionService.expandAccordionItems(expand, this.accordions);

    this.eventGroupSummaryComponents
      ?.toArray()
      ?.forEach(comp => comp.expandAccordionItems(expand));
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
