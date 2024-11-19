import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NUMBER_PATTERN } from 'src/app/core/constants';
import { EventTemplate } from 'src/app/pages/event-group-template/event-group-template.model';
import { RecurrenceLimit } from 'src/app/pages/programs/event.model';
import { DialogMode } from 'src/app/pages/programs/program.model';
import { CustomFormGroup, FormService } from 'src/app/services/form-service/form.service';

@Component({
  selector: 'app-event-group-template-event-details',
  templateUrl: './event-group-template-event-details.component.html',
  styleUrls: ['./event-group-template-event-details.component.scss']
})
export class EventGroupTemplateEventDetailsComponent implements OnInit {
  @Input()
  form!: CustomFormGroup<EventTemplate>;

  @Input()
  disabled: boolean = false;

  @Input()
  dialogMode!: DialogMode;

  constructor(
    private formService: FormService
  ) { }

  ngOnInit(): void {
  }

  private getFormValidationMap(): Map<AbstractControl, ValidatorFn | Array<ValidatorFn> | null> {
    const formValidationMap = new Map<AbstractControl, ValidatorFn | Array<ValidatorFn> | null>();

    formValidationMap.set(
      this.form.controls.eventName,
      [Validators.required]
    );

    formValidationMap.set(
      this.form.controls.eventTypeId,
      [Validators.required]
    );

    formValidationMap.set(
      this.form.controls.recurrenceLimit,
      [Validators.required]
    );

    if (this.form.controls.recurrenceLimit?.value >= RecurrenceLimit.UpTo) {
      formValidationMap.set(
        this.form.controls.occurrence!,
        [Validators.required, Validators.pattern(NUMBER_PATTERN), this.occurrenceRangeValidator.bind(this)]
      );
    }

    return formValidationMap;
  }

  private occurrenceRangeValidator(): ValidationErrors | null {
    let isValid = true;

    const value = this.form.controls.occurrence?.value;

    if (value) {
      if (value < 2) { isValid = false }

      if (!isValid) {
        return { rangeError: true }
      }
    }

    return null;
  }

  validate(): boolean {
    return this.formService.validate(this.getFormValidationMap());
  }
}
