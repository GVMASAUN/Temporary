import { Component, HostListener, Inject, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonColor, ButtonIconType } from '@visa/vds-angular';
import { Option } from 'src/app/core/models/option.model';
import { DialogMode } from 'src/app/pages/programs/program.model';
import { ExploreTemplateService } from 'src/app/services/explore-template/explore-template.service';
import { Utils } from 'src/app/services/utils';
import { EpmTemplateField } from '../../../explore-template.model';
import { HttpStatusCode } from '@angular/common/http';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';

@Component({
  selector: 'app-edit-message-fields',
  templateUrl: './edit-message-fields.component.html',
  styleUrls: ['./edit-message-fields.component.scss']
})
export class EditMessageFieldsComponent implements OnInit, OnDestroy {
  requiredFieldForm: FormGroup = this.formBuilder.group({
    requiredMessageFields: [undefined]
  });


  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  EpmTemplateField = EpmTemplateField;
  DialogMode = DialogMode;


  mode: DialogMode = DialogMode.CREATE;

  isLoading: boolean = false;

  availableFields: Option[] = [];


  get messageField() {
    return this.requiredFieldForm.get('requiredMessageFields')?.value;
  }

  @HostListener("window:keyup.esc")
  onKeyUp(): void {
    this.close();
  }

  constructor(
    private formBuilder: FormBuilder,
    private templateService: ExploreTemplateService,
    private viewContainerRef:ViewContainerRef,
    private alertService: ToggleAlertService,
    private dialogRef: MatDialogRef<EditMessageFieldsComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any
  ) { }

  ngOnInit(): void {
    this.setDialogData();
    this.getMessageFields();
  }

  private setDialogData() {
    const dialogConfig = this.dialogConfig;

    if (dialogConfig) {
      this.requiredFieldForm
        .get('requiredMessageFields')
        ?.patchValue(dialogConfig.form.value?.[EpmTemplateField.TEMPLATE_SYSTEM_DEFINED_FIELD_AS_LIST]);

      if (Utils.isNotNull(this.messageField)) {
        this.mode = DialogMode.EDIT
      }
    }
  }

  private getMessageFields() {
    this.isLoading = true;

    return this.templateService.getMessageFields().subscribe(
      response => {
        this.isLoading = false;

        if ((response.statusCode === HttpStatusCode.Ok) && Utils.isNull(response.errors)) {
          const data = response.data;

          if (data) {
            this.availableFields = data.map(
              (messageField) =>
                new Option(messageField.name, messageField.name!)
            );
          }
        } else {
          this.alertService.showResponseErrors(response?.errors);
        }

      }
    );
  }

  save() {
    this.dialogRef.close({
      data: this.messageField
    });
  }

  close() {
    this.dialogRef.close({
      cancel: true
    });
  }


  ngOnDestroy(): void {
    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );  }

}
