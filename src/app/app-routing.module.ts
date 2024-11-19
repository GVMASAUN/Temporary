import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './core/app-layout/app-layout.component';
import { EMPTY } from './core/constants';
import { Module } from './core/models/module.model';
import { LoginComponent } from './pages/login/login.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

const routes: Routes = [
  {
    path: EMPTY,
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { module: { uiName: 'Login' } }
  },
  {
    path: EMPTY,
    component: AppLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('src/app/pages/dashboard/dashboard.module').then(
            module => module.DashboardModule
          ),
        data: { module: 'Dashboard' }
      },
      {
        path: 'client-view',
        loadChildren: () =>
          import('src/app/pages/client-view/client-view.module').then(
            module => module.ClientViewModule
          ),
        data: { module: { uiName: 'Client View' } }
      },
      {
        path: Module.CLIENT.baseUrl,
        loadChildren: () =>
          import('src/app/pages/clients/clients.module').then(
            module => module.ClientsModule
          ),
        data: { module: Module.CLIENT }
      },
      {
        path: 'merchant',
        loadChildren: () =>
          import('src/app/pages/merchant/merchant.module').then(
            module => module.MerchantModule
          ),
        data: { module: Module.MERCHANT }
      },
      {
        path: Module.PROGRAM.baseUrl,
        loadChildren: () =>
          import('src/app/pages/programs/programs.module').then(
            module => module.ProgramsModule
          ),
        data: { module: Module.PROGRAM }
      },
      {
        path: Module.UNCATEGORIZED_OFFER.baseUrl,
        loadChildren: () =>
          import(
            'src/app/pages/uncategorized-offers/uncategorized-offers.module'
          ).then(module => module.UncategorizedOffersModule),
        data: { module: Module.UNCATEGORIZED_OFFER }
      },
      {
        path: Module.EVENT_GROUP_TEMPLATE.baseUrl,
        loadChildren: () =>
          import(
            'src/app/pages/event-group-template/event-group-template.module'
          ).then(module => module.EventGroupTemplateModule),
        data: { module: Module.EVENT_GROUP_TEMPLATE, }
      },
      {
        path: Module.PAY_WITH_POINT.baseUrl,
        loadChildren: () =>
          import('src/app/pages/pay-with-point/pay-with-point.module').then(
            module => module.PayWithPointModule
          ),
        data: { module: Module.PAY_WITH_POINT }
      },
      {
        path: Module.ENROLLMENT_COLLECTION.baseUrl,
        loadChildren: () =>
          import(
            'src/app/pages/enrollment-collection/enrollment-collection.module'
          ).then(module => module.EnrollmentCollectionModule),
        data: { module: Module.ENROLLMENT_COLLECTION }
      },
      {
        path: 'templates',
        loadChildren: () =>
          import('src/app/pages/templates/templates.module').then(
            module => module.TemplatesModule
          ),
        data: { module: { uiName: 'Templates' } }
      },
      {
        path: Module.REPORT.baseUrl,
        loadChildren: () =>
          import('src/app/pages/reporting/reporting.module').then(
            module => module.ReportingModule
          ),
        data: { module: Module.REPORT }
      },
      {
        path: Module.FILE_TRANSFER.baseUrl,
        loadChildren: () =>
          import('src/app/pages/file-transfers/file-transfers.module').then(
            module => module.FileTransfersModule
          ),
        data: { module: Module.FILE_TRANSFER }
      },
      {
        path: Module.SUPPORT.baseUrl,
        loadChildren: () =>
          import('src/app/pages/help-support/help-support.module').then(
            module => module.HelpSupportModule
          ),
        data: { module: Module.SUPPORT }
      },
      {
        path: Module.ACTIVITY.baseUrl,
        loadChildren: () =>
          import('src/app/pages/activity/activity.module').then(
            module => module.ActivityModule
          ),
        data: { module: Module.ACTIVITY }
      },
      {
        path: Module.EPM_TEMPLATE.baseUrl,
        loadChildren: () =>
          import('src/app/pages/epm-template/epm-template.module').then(
            module => module.EpmTemplateModule
          ),
        data: { module: Module.EPM_TEMPLATE }
      },
      {
        path: Module.USER.baseUrl,
        loadChildren: () =>
          import('src/app/pages/users/users.module').then(
            module => module.UsersModule
          ),
        data: { module: Module.USER }
      }
    ]
  },
  {
    path: '**',
    component: NotFoundComponent,
    data: { module: { uiName: '404 - Page not found' } }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
