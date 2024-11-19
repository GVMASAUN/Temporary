import { HttpStatusCode } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ButtonColor, ButtonIconType } from '@visa/vds-angular';
import { Option } from 'src/app/core/models/option.model';
import { DialogMode } from 'src/app/pages/programs/program.model';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';
import { EpmTemplateField } from '../../../epm-template.model';
import { EpmTemplateService } from 'src/app/services/epm-template/epm-template.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-add-edit-message-fields-dialog',
  templateUrl: './add-edit-message-fields-dialog.component.html',
  styleUrls: ['./add-edit-message-fields-dialog.component.scss']
})
export class AddEditMessageFieldsDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  EpmTemplateField = EpmTemplateField;
  DialogMode = DialogMode;

  mode: DialogMode = DialogMode.CREATE;

  requiredFieldForm: UntypedFormGroup = this.formBuilder.group({
    requiredMessageFields: [undefined]
  });

  isLoading: boolean = false;

  availableFields: Option[] = [];

  get messageField() {
    return this.requiredFieldForm.get('requiredMessageFields')?.value;
  }

  constructor(
    private formBuilder: UntypedFormBuilder,
    private templateService: EpmTemplateService,
    private viewContainerRef: ViewContainerRef,
    private alertService: ToggleAlertService,
    private dialogService: DialogService,
    private dialogRef: MatDialogRef<AddEditMessageFieldsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any
  ) {
    this.dialogService.setDialogEventListeners(
      this.dialogRef,
      () => { this.close(); }
    ).pipe(takeUntil(this.destroy$)).subscribe();
   }

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

  close() {
    this.dialogRef.close({
      data: this.messageField
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }

}
