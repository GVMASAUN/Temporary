import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EMPTY } from 'src/app/core/constants';
import { EventGroupTemplateListComponent } from './list/event-group-template-list/event-group-template-list.component';
import { EventGroupTemplateCreateComponent } from './create/event-group-template-create/event-group-template-create.component';
import { EventGroupTemplateManageComponent } from './manage/event-group-template-manage/event-group-template-manage.component';
import { Module } from 'src/app/core/models/module.model';

const routes: Routes = [
  {
    path: EMPTY,
    component: EventGroupTemplateListComponent,
    data: { title: Module.EVENT_GROUP_TEMPLATE.uiName }
  },
  {
    path: 'create',
    component: EventGroupTemplateCreateComponent,
    data: { title: 'Create Event Group Template' }
  },
  {
    path: 'manage/:id',
    component: EventGroupTemplateManageComponent,
    data: { title: 'Manage Event Group Template' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventGroupTemplateRoutingModule { }
