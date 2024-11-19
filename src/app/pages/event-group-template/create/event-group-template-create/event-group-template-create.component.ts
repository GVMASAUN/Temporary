import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AlertType, ButtonColor, TabsOrientation } from '@visa/vds-angular';
import { SUCCESS, SUCCESS_CODE } from 'src/app/core/constants';
import { ResponseError } from 'src/app/core/models/pagination-response.model';
import { EventGroupStep } from 'src/app/pages/programs/event-group.model';
import { EventGroupTemplateService } from 'src/app/services/event-group-template.service';
import { CustomFormGroup, FormBuilder } from 'src/app/services/form-service/form.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';
import { EventGroupTemplate, EventTemplate } from '../../event-group-template.model';
import { EventGroupTemplateBasicsComponent } from '../../shared/event-group-template-basics/event-group-template-basics.component';
import { Router } from '@angular/router';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { EpmTemplateService } from 'src/app/services/epm-template/epm-template.service';

@Component({
  selector: 'app-event-group-template-create',
  templateUrl: './event-group-template-create.component.html',
  styleUrls: ['./event-group-template-create.component.scss']
})
export class EventGroupTemplateCreateComponent implements OnInit, OnDestroy {
  readonly viewName = "event-group-template-create";

  @ViewChild(EventGroupTemplateBasicsComponent)
  eventGroupTemplateBasicsComponent!: EventGroupTemplateBasicsComponent;

  TabsOrientation = TabsOrientation;
  ButtonColor = ButtonColor;
  EventGroupStep = EventGroupStep;

  form: CustomFormGroup<EventGroupTemplate> = this.formBuilder.group(new EventGroupTemplate());

  selectedTabIndex: number = 0;

  enableActionButtons: boolean = false;
  initialized: boolean = true;

  tabs: string[] = [
    EventGroupStep.BASICS,
    EventGroupStep.EVENTS
  ];

  getTabId: Function = this.functionService.getTabId;
  getTabLabelledById: Function = this.functionService.getTabLabelledById;

  get showCloseButton(): boolean {
    return this.selectedTabIndex === this.tabs.indexOf(EventGroupStep.EVENTS)
  }

  get eventTemplate(): EventTemplate {
    return this.form.getRawValue();
  }

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private navStatusService: NavStatusService,
    private toggleAlertService: ToggleAlertService,
    private functionService: FunctionsService,
    private eventGroupTemplateService: EventGroupTemplateService,
    private epmTemplateService: EpmTemplateService,
    private viewContainerRef: ViewContainerRef
  ) { }

  private setAlertMessage() {
    this.toggleAlertService.showSuccessMessage("Event Group Template added successfully.");
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

  private navigateToManage(response: EventGroupTemplate) {
    this.router.navigate(
      ['event-group-template', 'manage', response.eventGroupTemplateId],
      {
        queryParamsHandling: 'merge'
      });
  }

  private setCommunityCode() {
    this.enableActionButtons = false;

    this.epmTemplateService.getCommunityGroup()
      .subscribe(response => {
        if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
          this.form.controls.communityCode.patchValue(response.data.communityCode);

          this.enableActionButtons = true;

        } else {
          this.toggleAlertService.showResponseErrors(response.errors);
        }
      });
  }

  ngAfterViewInit(): void {
    this.navStatusService.setOverlayStatus(true);

    this.setCommunityCode();
  }

  ngOnInit(): void {
  }

  onTabChange(event: any) {
    this.navStatusService.togglePanel(false);
  }

  hideTab(step: EventGroupStep): boolean {
    return this.selectedTabIndex !== this.tabs.indexOf(step);
  }

  handleSubmit(saveAndExit: boolean = false) {
    const isValid = this.eventGroupTemplateBasicsComponent.validate();

    if (isValid) {

      this.eventGroupTemplateService.createEventGroupTemplate(
        this.form.getRawValue()
      ).subscribe({
        next: response => {
          if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
            this.setAlertMessage();

            if (saveAndExit) {
              this.navigateToTemplateList();
            }
            this.navigateToManage(response.data);
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

  ngOnDestroy(): void {
    this.navStatusService.setOverlayStatus(false);

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }
}
