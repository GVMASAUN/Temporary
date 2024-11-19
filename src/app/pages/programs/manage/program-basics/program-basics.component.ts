import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ButtonColor } from '@visa/vds-angular';
import { Mode } from 'src/app/core/models/mode.model';
import { ProgramService } from 'src/app/services/program/program.service';
import { Program } from '../../program.model';
import { EMPTY, SUCCESS_CODE, VisaIcon } from 'src/app/core/constants';
import { FormService } from 'src/app/services/form-service/form.service';
import { ResponseError } from 'src/app/core/models/pagination-response.model';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-program-basics',
  templateUrl: './program-basics.component.html',
  styleUrls: ['./program-basics.component.scss']
})
export class ProgramBasicsComponent implements OnInit {
  Mode = Mode;
  ButtonColor = ButtonColor;
  VisaIcon = VisaIcon;

  @Input()
  mode!: Mode;

  @Input()
  form!: UntypedFormGroup;

  @Output()
  onSubmitEmitter: EventEmitter<boolean> = new EventEmitter();

  get program(): Program {
    return this.form.getRawValue() as Program;
  }

  constructor(
    private programService: ProgramService,
    private formService: FormService,
    private alertService: ToggleAlertService,
    private router: Router
  ) { }

  private setErrorMessages(responseErrors: ResponseError[]): void {
    this.alertService.showResponseErrors(responseErrors);
    this.programService.updateErrorMessages(responseErrors, this.form);
  }

  private getFormValidationMap(): Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null> {
    const formValidationMap = new Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null>();

    formValidationMap.set(this.form.get('programName'),
      [Validators.required]
    );

    return formValidationMap;
  }

  ngOnInit(): void { }

  protected update(exit = false): void {
    const valid = this.formService.validate(this.getFormValidationMap());

    if (valid) {
      this.programService.updateProgram(this.program)
        .subscribe({
          next: response => {
            if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
              this.alertService.showSuccessMessage('Program updated successfully.');

              if (exit) {
                this.router.navigate(['program'], {
                  queryParamsHandling: 'merge'
                });
              } else {
                this.onSubmitEmitter.emit(true);
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

  protected getErrorMessage(controlName: string): string {
    return this.programService.getErrorMessage(this.form, controlName);
  }
}
