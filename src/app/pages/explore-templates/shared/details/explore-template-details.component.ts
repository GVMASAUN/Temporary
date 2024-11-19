import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ButtonColor, ButtonIconType, DialogService } from '@visa/vds-angular';
import { Option } from 'src/app/core/models/option.model';
import { EditMessageFieldsComponent } from './edit-message-fields/edit-message-fields.component';
import { EpmTemplateAssociationDesc, CustomField, EpmTemplate, EpmTemplateField } from '../../explore-template.model';
import { ExploreTemplateService } from 'src/app/services/explore-template/explore-template.service';
import { EMPTY } from 'src/app/core/constants';
import { Utils } from 'src/app/services/utils';
import { FormService } from 'src/app/services/form-service/form.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Mode } from 'src/app/core/models/mode.model';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-details',
  templateUrl: './explore-template-details.component.html',
  styleUrls: ['./explore-template-details.component.scss']
})
export class ExploreTemplateDetailsComponent implements OnInit, OnDestroy {
  @Input()
  form!: FormGroup;

  @Input()
  mode: Mode = Mode.Create;

  private destroy$ = new Subject<void>();

  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  EpmTemplateField = EpmTemplateField;
  MODE = Mode;


  showCustomFieldInputSection: boolean = false;
  communityGroup: string = EMPTY;
  communityLevel: string = EMPTY;

  customFieldForm: FormGroup = this.formBuilder.group(new CustomField());


  associations: Option[] = [];

  get epmTemplate(): EpmTemplate {
    return this.form.getRawValue() as EpmTemplate;
  }

  get customField(): string {
    return this.customFieldForm.get('customFieldInput')?.value;
  }

  constructor(
    private formBuilder: FormBuilder,
    private templateService: ExploreTemplateService,
    private formService: FormService,
    private dialog: MatDialog
  ) { }


  private getFormValidationMap(): Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null> {
    const formValidationMap = new Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null>();

    formValidationMap.set(this.form.get(EpmTemplateField.TEMPLATE_MESSAGE_NAME),
      [Validators.required]
    );

    formValidationMap.set(this.form.get(EpmTemplateField.TEMPLATE_COMMUNITY_CODE),
      [Validators.required]
    );

    return formValidationMap;
  }

  private registerOnChangeListeners() {

  }

  private setAssociations() {
    this.templateService.getCommunityGroup().subscribe(response => {
      if (response) {
        this.communityGroup = response.data.communityCode!;
      }
      this.communityLevel = this.templateService.communityCode;
      this.associations = [
        new Option(this.communityGroup, EpmTemplateAssociationDesc.COMMUNITY_GROUP),
        new Option(this.communityLevel, EpmTemplateAssociationDesc.COMMUNITY_LEVEL)
      ];
    });
  }

  ngOnInit(): void {
    this.registerOnChangeListeners();
    this.setAssociations();
  }

  public ResetCustomFieldForm() {
    this.customFieldForm.reset();
  }

  public deleteCustomField(index: number) {
    this.epmTemplate.userDefinedFieldAsList?.splice(index, 1);
  }

  public closeCustomFieldInputSection() {
    this.showCustomFieldInputSection = !this.showCustomFieldInputSection;
    this.ResetCustomFieldForm();
  }

  public addCustomField() {
    let value = this.customFieldForm.get('customFieldInput')?.value;
    if (Utils.isNotNull(value)) {
      let customFields = this.form.get([EpmTemplateField.TEMPLATE_USER_DEFINED_FIELD_AS_LIST])?.value as CustomField[];

      if (customFields === null) { customFields = [] }

      customFields.push(value);
      this.ResetCustomFieldForm();

      this.form.get([EpmTemplateField.TEMPLATE_USER_DEFINED_FIELD_AS_LIST])
        ?.patchValue(customFields);
    }
  }

  public editMessageFields() {
    const dialogRef = this.dialog.open(
      EditMessageFieldsComponent,
      {
        hasBackdrop: true, disableClose: true,
        data: { form: this.form }
      }
    );

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        const epmTemplate = response;
        if (epmTemplate && !epmTemplate.cancel) {
          this.form
            .get(EpmTemplateField.TEMPLATE_SYSTEM_DEFINED_FIELD_AS_LIST)
            ?.patchValue(response.data);
        }
      });
  }

  public clearAllMessageFields() {
    while (this.epmTemplate.systemDefinedFieldAsList?.length) {
      this.epmTemplate.systemDefinedFieldAsList.pop();
    }
  }

  public clearAllCustomFields() {
    while (this.epmTemplate.userDefinedFieldAsList?.length) {
      this.epmTemplate.userDefinedFieldAsList.pop();
    }
  }

  getErrorMessage(form: FormGroup, controlName: string): string {
    return this.templateService.getErrorMessage(this.form, controlName);
  }

  validate(): boolean {
    return this.formService.validate(this.getFormValidationMap());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
