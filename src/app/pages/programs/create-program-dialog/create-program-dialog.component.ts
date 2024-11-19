import { AfterViewInit, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ButtonColor } from '@visa/vds-angular';
import { EMPTY, SUCCESS_CODE } from 'src/app/core/constants';
import { Option } from 'src/app/core/models/option.model';
import { ResponseError } from 'src/app/core/models/pagination-response.model';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { ProgramService } from 'src/app/services/program/program.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';
import { Program, ProgramType } from '../program.model';
import { FormService } from 'src/app/services/form-service/form.service';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-create-program-dialog',
  templateUrl: './create-program-dialog.component.html',
  styleUrls: ['./create-program-dialog.component.scss']
})
export class CreateProgramDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ButtonColor = ButtonColor;

  form = this.formBuilder.group(new Program());

  isLoading: boolean = false;

  errMsg: string = EMPTY;

  programStructures: Option[] = [];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private programService: ProgramService,
    private formService: FormService,
    private alertService: ToggleAlertService,
    private router: Router,
    private dialogService: DialogService,
    private viewContainerRef: ViewContainerRef,
    private dialogRef: MatDialogRef<CreateProgramDialogComponent>
  ) {
    this.dialogService.setDialogEventListeners(
      this.dialogRef,
      () => { this.close(); }
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  private setCommunityCode() {
    this.form
      .get('communityCode')
      ?.patchValue(this.programService.communityCode);
  }

  private getProgramStructures() {
    this.programService.getProgramStructures().subscribe(response => {
      const data = response.data;
      if (data) {
        this.programStructures = data.map(
          item => new Option(item.id, item.programStructureName, item)
        );
      }
    });
  }

  private validate(): boolean {
    const formValidationMap = this.getFormValidationMap();
    const controls: AbstractControl[] = [];

    const formControlNames = Array.from(formValidationMap.keys());

    formControlNames.map(name => {
      const control = this.form.get(name);
      if (control) {
        control?.setValidators(formValidationMap.get(name) ?? []);
        control?.markAsTouched();
        control?.updateValueAndValidity({ emitEvent: false });
        controls?.push(control);
      }
    })

    if (controls.reduce((acc, val) => acc && !val.invalid, true)) {
      return true;
    }

    return false;
  }

  private setResponseErrors(responseErrors: ResponseError[]) {
    this.alertService.showResponseErrors(responseErrors);

    this.programService.updateErrorMessages(responseErrors, this.form);
  }

  private getFormValidationMap(): Map<string, ValidatorFn | Array<ValidatorFn> | null> {
    const formValidationMap = new Map<string, ValidatorFn | Array<ValidatorFn> | null>();

    formValidationMap.set('programName',
      [Validators.required]
    );

    return formValidationMap;
  }


  ngOnInit(): void {
    this.setCommunityCode();
    this.getProgramStructures();

    this.form.get('programType')?.patchValue(ProgramType.REAL_TIME);
  }

  ngAfterViewInit(): void {
    this.formService.clearFormControlValidators(this.form);
  }

  save() {
    const isValid = this.validate();

    if (isValid) {
      const programData = this.form.getRawValue() as Program;
      this.isLoading = true;

      this.programService.createProgram(programData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {

            this.close();

            this.alertService.showSuccessMessage('Program added successfully.')

            this.router.navigate(['program', 'manage', response?.data?.programStageId], {
              queryParamsHandling: 'merge'
            });

          } else {
            this.setResponseErrors(response.errors);
          }
        }, error: (err) => {
          this.isLoading = false;
          console.log(err);
        }
      });
    } else {
      this.alertService.showError();
    }
  }

  close() {
    this.dialogRef.close();
  }


  getErrorMessage(form: UntypedFormGroup, controlName: string): string {
    return this.programService.getErrorMessage(this.form, controlName);
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
