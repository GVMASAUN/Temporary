import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SupportComponent } from './support/support.component';
import { Module } from 'src/app/core/models/module.model';
import { EMPTY } from 'src/app/core/constants';

const routes: Routes = [
  {
    path: EMPTY,
    component: SupportComponent,
    data: { title: Module.SUPPORT.uiName }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HelpSupportRoutingModule { }
