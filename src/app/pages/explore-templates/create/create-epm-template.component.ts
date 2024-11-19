import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertType, ButtonColor, ButtonIconType, TabsOrientation } from '@visa/vds-angular';
import { EpmTemplate, EpmTemplateField, EpmTemplateStep, ExploreTemplateStep } from 'src/app/pages/explore-templates/explore-template.model';
import { ExploreTemplateService } from 'src/app/services/explore-template/explore-template.service';
import { Utils } from 'src/app/services/utils';
import { ExploreTemplateDetailsComponent } from '../shared/details/explore-template-details.component';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { EMPTY, ERROR, SUCCESS_CODE } from 'src/app/core/constants';
import { PaginationResponse, ResponseError } from 'src/app/core/models/pagination-response.model';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';

@Component({
  selector: 'app-create-epm-template',
  templateUrl: './create-epm-template.component.html',
  styleUrls: ['./create-epm-template.component.scss']
})
export class CreateEpmTemplateComponent implements OnInit, OnDestroy {
  readonly viewName = "create-epm-template";

  @ViewChild(ExploreTemplateDetailsComponent)
  exploreTemplateDetailsComponent!: ExploreTemplateDetailsComponent;

  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  ExploreTemplateStep = ExploreTemplateStep;
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
    private formBuilder: FormBuilder,
    private router: Router,
    private alertService: ToggleAlertService,
    private functionService: FunctionsService,
    private templateService: ExploreTemplateService,
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
    this.router.navigate(['explore-template', 'manage', messageId], {
      queryParamsHandling: 'merge'
    });
  }

  private navigateToTemplateList() {
    this.router.navigate(['explore-template'], {
      queryParamsHandling: 'merge'
    });
  }

  ngOnInit(): void {
    this.navStatusService.setOverlayStatus(true);

    this.setCurrentTab();
  }

  onTabChange(event: any) {
    this.navStatusService.panelStatusChanged(false);
  }

  create(exit = false) {
    const isValid = this.exploreTemplateDetailsComponent.validate();

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
