import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { EventTemplate } from 'src/app/pages/event-group-template/event-group-template.model';
import { EventRelationshipsComponent } from 'src/app/pages/programs/manage/program-event-group/create-edit-event/event-relationships/event-relationships.component';
import { DialogMode } from 'src/app/pages/programs/program.model';

@Component({
  selector: 'app-event-group-template-event-relationships',
  templateUrl: './event-group-template-event-relationships.component.html',
  styleUrls: ['./event-group-template-event-relationships.component.scss']
})
export class EventGroupTemplateEventRelationshipsComponent implements OnInit {
  @ViewChild(EventRelationshipsComponent)
  relationshipComponent!: EventRelationshipsComponent;

  @Input()
  form!: UntypedFormGroup;

  @Input()
  disabled: boolean = false;

  @Input()
  dialogMode!: DialogMode;

  get eventTemplate(): EventTemplate {
    return this.form.getRawValue();
  }

  constructor() { }

  ngOnInit(): void {
  }

}
