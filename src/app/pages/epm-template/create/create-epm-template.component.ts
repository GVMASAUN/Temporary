import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonColor, ButtonIconType, TabsOrientation } from '@visa/vds-angular';
import { SUCCESS_CODE } from 'src/app/core/constants';
import { ResponseError } from 'src/app/core/models/pagination-response.model';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';
import { EpmTemplate, EpmTemplateField, EpmTemplateStep, EpmTemplateListStep } from '../epm-template.model';
import { EpmTemplateDetailsComponent } from '../shared/details/epm-template-details.component';
import { EpmTemplateService } from 'src/app/services/epm-template/epm-template.service';

@Component({
  selector: 'app-create-epm-template',
  templateUrl: './create-epm-template.component.html',
  styleUrls: ['./create-epm-template.component.scss']
})
export class CreateEpmTemplateComponent implements OnInit, OnDestroy {
  readonly viewName = "create-epm-template";

  @ViewChild(EpmTemplateDetailsComponent)
  epmTemplateDetailsComponent!: EpmTemplateDetailsComponent;

  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  EpmTemplateListStep = EpmTemplateListStep;
  EpmTemplateStep = EpmTemplateStep;
  TabsOrientation = TabsOrientation;
  EpmTemplateField = EpmTemplateField;

  epmTemplateForm = this.formBuilder.group(new EpmTemplate());

  selectedTabIndex: number = 0;

  tabs: string[] = [
    EpmTemplateStep.DETAILS,
    // EpmTemplateStep.LINKED_EVENT_GROUPS,
    // EpmTemplateStep.HISTORY
  ]

  getTabId: Function = this.functionService.getTabId;
  getTabLabelledById: Function = this.functionService.getTabLabelledById;

  get epmTemplate(): EpmTemplate {
    return this.epmTemplateForm.getRawValue() as EpmTemplate;
  }

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private alertService: ToggleAlertService,
    private functionService: FunctionsService,
    private templateService: EpmTemplateService,
    private navStatusService: NavStatusService,
    private viewContainerRef: ViewContainerRef
  ) { }

  private setErrorMessages(responseErrors: ResponseError[]) {
    this.alertService.showResponseErrors(responseErrors);
    this.templateService.updateErrorMessages(responseErrors, this.epmTemplateForm);
  }

  private setCurrentTab() {
    this.selectedTabIndex = this.tabs.indexOf(EpmTemplateStep.DETAILS);
  }

  private navigateToManagePage(messageId: string) {
    this.router.navigate(['epm-template', 'manage', messageId], {
      queryParamsHandling: 'merge'
    });
  }

  private navigateToTemplateList() {
    this.router.navigate(['epm-template'], {
      queryParamsHandling: 'merge'
    });
  }

  ngOnInit(): void {
    this.navStatusService.setOverlayStatus(true);

    this.setCurrentTab();
  }

  onTabChange(event: any) {
    this.navStatusService.togglePanel(false);
  }

  create(exit = false) {
    const isValid = this.epmTemplateDetailsComponent.validate();

    if (isValid) {
      const payload = this.epmTemplateForm.getRawValue();

      this.templateService.createEpmTemplate(payload)
        .subscribe({
          next: response => {
            if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
              this.alertService.showSuccessMessage('EPM template added successfully.');

              if (exit) {
                this.navigateToTemplateList();
              } else {
                localStorage.setItem('selectedEPM', JSON.stringify(response.data));

                this.navigateToManagePage(response.data[EpmTemplateField.TEMPLATE_MESSAGE_ID]!);
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

  close() {
    this.navigateToTemplateList();
  }

  ngOnDestroy(): void {
    this.navStatusService.setOverlayStatus(false);

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }
}
