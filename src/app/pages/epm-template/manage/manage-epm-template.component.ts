import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonColor, ButtonIconType, TabsOrientation } from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SUCCESS_CODE } from 'src/app/core/constants';
import { Mode } from 'src/app/core/models/mode.model';
import { ResponseError } from 'src/app/core/models/pagination-response.model';
import { FormService } from 'src/app/services/form-service/form.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';
import { EpmTemplate, EpmTemplateField, EpmTemplateListStep, EpmTemplateStep } from '../epm-template.model';
import { EpmTemplateDetailsComponent } from '../shared/details/epm-template-details.component';
import { EpmTemplateService } from 'src/app/services/epm-template/epm-template.service';

@Component({
  selector: 'app-manage-epm-template',
  templateUrl: './manage-epm-template.component.html',
  styleUrls: ['./manage-epm-template.component.scss']
})
export class ManageEpmTemplateComponent implements OnInit, OnDestroy {
  @ViewChild(EpmTemplateDetailsComponent)
  epmTemplateDetailsComponent!: EpmTemplateDetailsComponent;


  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  EpmTemplateListStep = EpmTemplateListStep;
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
    EpmTemplateStep.HISTORY
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
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private templateService: EpmTemplateService,
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
    this.router.navigate(['epm-template'], {
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
    const isValid = this.epmTemplateDetailsComponent.validate();

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
