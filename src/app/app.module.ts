import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';

import { VdsLibService } from '@visa/vds-angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppLayoutComponent } from './core/app-layout/app-layout.component';
import { GlobalErrorHandler } from './core/global-error-handler';
import { ProgressSpinnerInterceptor } from './core/interceptors/progress-spinner-interceptor';
import { RequestHandlerInterceptor } from './core/interceptors/request-handler.interceptor';
import { SessionWarningDialogComponent } from './core/session-warning-dialog/session-warning-dialog.component';
import { LoginComponent } from './pages/login/login.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ApiConfigService } from './services/api-config.service';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    AppLayoutComponent,
    LoginComponent,
    SessionWarningDialogComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    SharedModule,
  ],
  providers: [
    VdsLibService,
    Title,
    ApiConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: startUpServiceFactory,
      deps: [ApiConfigService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestHandlerInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ProgressSpinnerInterceptor,
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

/**
 * startUpServiceFactory function is a factory function that returns a function that will be executed before the app is initialized.
 * This function will call the getConfig method of the ApiConfigService. 
 * ApiConfigService is a service that will load the configuration from the json file and store it in a service variable.
*/
export function startUpServiceFactory(startupService: ApiConfigService) {
  return () => startupService.loadConfig();
}
