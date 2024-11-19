import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { DialogMode } from 'src/app/pages/programs/program.model';

@Component({
  selector: 'app-event-group-template-event-conditions',
  templateUrl: './event-group-template-event-conditions.component.html',
  styleUrls: ['./event-group-template-event-conditions.component.scss']
})
export class EventGroupTemplateEventConditionsComponent implements OnInit {

  @Input()
  form!: UntypedFormGroup;

  @Input()
  disabled: boolean = false;

  @Input()
  dialogMode!: DialogMode;
  
  @Output()
  onSubmitEmitter: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  handleSubmit(event:any){

  }

}
