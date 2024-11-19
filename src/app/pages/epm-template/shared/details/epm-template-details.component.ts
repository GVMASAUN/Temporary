import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ButtonColor, ButtonIconType } from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EMPTY } from 'src/app/core/constants';
import { Mode } from 'src/app/core/models/mode.model';
import { Option } from 'src/app/core/models/option.model';
import { EpmTemplateService } from 'src/app/services/epm-template/epm-template.service';
import { FormService } from 'src/app/services/form-service/form.service';
import { Utils } from 'src/app/services/utils';
import { CustomField, EpmTemplate, EpmTemplateAssociationDesc, EpmTemplateField } from '../../epm-template.model';
import { AddEditMessageFieldsDialogComponent } from './add-edit-message-fields-dialog/add-edit-message-fields-dialog.component';

@Component({
  selector: 'app-epm-template-details',
  templateUrl: './epm-template-details.component.html',
  styleUrls: ['./epm-template-details.component.scss']
})
export class EpmTemplateDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  form!: UntypedFormGroup;

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

  customFieldForm: UntypedFormGroup = this.formBuilder.group(new CustomField());


  associations: Option[] = [];

  get epmTemplate(): EpmTemplate {
    return this.form.getRawValue() as EpmTemplate;
  }

  get customField(): string {
    return this.customFieldForm.get('customFieldInput')?.value;
  }

  constructor(
    private formBuilder: UntypedFormBuilder,
    private templateService: EpmTemplateService,
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

  ngAfterViewInit(): void {
    this.formService.clearFormControlValidators(this.form);
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
      AddEditMessageFieldsDialogComponent,
      {
        hasBackdrop: true, disableClose: true,
        ariaLabel: 'edit-message-field-dialog',
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

  getErrorMessage(form: UntypedFormGroup, controlName: string): string {
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
