import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientListComponent } from './client-list/client-list.component';
import { EMPTY } from 'src/app/core/constants';
import { Module } from 'src/app/core/models/module.model';

const routes: Routes = [
  {
    path: EMPTY,
    component: ClientListComponent,
    data: { title: Module.CLIENT.uiName }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule { }
