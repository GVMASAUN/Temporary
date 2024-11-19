import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AlertType, ButtonColor, ButtonIconType, TabsOrientation } from '@visa/vds-angular';
import { EpmTemplate, EpmTemplateField, EpmTemplateStep, ExploreTemplateStep } from '../explore-template.model';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExploreTemplateService } from 'src/app/services/explore-template/explore-template.service';
import { Utils } from 'src/app/services/utils';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { ExploreTemplateDetailsComponent } from '../shared/details/explore-template-details.component';
import { FormService } from 'src/app/services/form-service/form.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { COMMA_SEPARATOR, ERROR, SUCCESS_CODE } from 'src/app/core/constants';
import { ResponseError } from 'src/app/core/models/pagination-response.model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Mode } from 'src/app/core/models/mode.model';

@Component({
  selector: 'app-manage-epm-template',
  templateUrl: './manage-epm-template.component.html',
  styleUrls: ['./manage-epm-template.component.scss']
})
export class ManageEpmTemplateComponent implements OnInit, OnDestroy {
  @ViewChild(ExploreTemplateDetailsComponent)
  exploreTemplateDetailsComponent!: ExploreTemplateDetailsComponent;


  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  ExploreTemplateStep = ExploreTemplateStep;
  TabsOrientation = TabsOrientation;
  EpmTemplateField = EpmTemplateField;
  EpmTemplateStep = EpmTemplateStep;
  MODE = Mode

  private destroy$ = new Subject<void>();
  readonly viewName = "manage-epm-template";

  epmTemplateForm = this.formBuilder.group(new EpmTemplate());

  selectedTabIndex: number = 0;
  initialized: boolean = false;

  tabs: string[] = [
    EpmTemplateStep.DETAILS,
    EpmTemplateStep.LINKED_EVENT_GROUPS,
    // EpmTemplateStep.HISTORY
  ];


  getTabId: Function = this.functionService.getTabId;
  getTabLabelledById: Function = this.functionService.getTabLabelledById;


  get epmTemplate(): EpmTemplate {
    return this.epmTemplateForm.getRawValue() as EpmTemplate;
  }

  get showCloseButton(): boolean {
    return this.selectedTabIndex !== this.tabs.indexOf(EpmTemplateStep.DETAILS)
  }

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private templateService: ExploreTemplateService,
    private route: ActivatedRoute,
    private formService: FormService,
    private alertService: ToggleAlertService,
    private navStatusService: NavStatusService,
    private functionService: FunctionsService,
    private viewContainerRef: ViewContainerRef
  ) { }

  private setCurrentTab() {
    this.selectedTabIndex = this.tabs.indexOf(EpmTemplateStep.DETAILS);
  }

  private init() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const messageId = params.get('id');

      if (messageId) {
        this.initialized = false;

        this.templateService.getEpmTemplate(messageId, this.selectedEPMCommunityCode())
          .subscribe({
            next: response => {
              if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
                this.mapEpmTemplate(response.data);
                this.initialized = true;
              } else {
                this.alertService.showResponseErrors(response.errors);
              }
            },
            error: err => {
              console.log(err);
            }
          });
      }
    });
  }

  private setErrorMessages(responseErrors: ResponseError[]) {
    this.alertService.showResponseErrors(responseErrors);

    this.templateService.updateErrorMessages(responseErrors, this.epmTemplateForm);
  }

  private mapEpmTemplate(epmTemplate: EpmTemplate) {
    this.epmTemplateForm.patchValue(epmTemplate);
    this.formService.clearFormControlValidators(this.epmTemplateForm);
    this.epmTemplateForm.markAsPristine();
  }

  private navigateToTemplateList() {
    this.router.navigate(['explore-template'], {
      queryParamsHandling: 'merge'
    });
  }

  private selectedEPMCommunityCode() {
    return JSON.parse(localStorage.getItem('selectedEPM') || '').communityCode;
  }


  ngOnInit(): void {
    this.navStatusService.setOverlayStatus(true);

    this.init();
    this.setCurrentTab();
  }

  close() {
    this.navigateToTemplateList();
  }

  update(exit = false) {
    const isValid = this.exploreTemplateDetailsComponent.validate();

    if (isValid) {
      const payload = this.epmTemplateForm.getRawValue();

      this.templateService.updateEpmTemplate(payload)
        .subscribe({
          next: response => {
            if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
              this.alertService.showSuccessMessage("EPM template successfully updated.");

              if (exit) {
                this.navigateToTemplateList();
              } else {
                this.ngOnInit();
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
      this.alertService.showError();
    }
  }

  hideTab(step: EpmTemplateStep): boolean {
    return this.selectedTabIndex !== this.tabs.indexOf(step);
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
