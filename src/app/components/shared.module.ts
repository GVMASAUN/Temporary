import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { VdsLibModule } from '@visa/vds-angular';
import { AlertBoxComponent } from './alert-box/alert-box.component';
import { DetailViewComponent } from './detail-view/detail-view.component';
import { HeaderComponent } from './header/header.component';
import { NavigationComponent } from './navigation/navigation.component';
import { OverlayComponent } from './overlay/overlay.component';
import { SearchTableComponent } from './search-table/search-table.component';
import { ShowColumnsComponent } from './show-columns/show-columns.component';
import { ShuttleBoxComponent } from './shuttle-box/shuttle-box.component';
import { SiteMapComponent } from './site-map/site-map.component';
import { StatusComponent } from './status/status.component';
import { TimePickerComponent } from './time-picker/time-picker.component';
import { FooterComponent } from './footer/footer.component';
import { PanelComponent } from './panel/panel.component';
import { DialogComponent } from '../core/dialog/dialog.component';
import { CommentsModalComponent } from './comments-modal/comments-modal.component';
import { ControlConverterPipe } from '../pipes/formControlPipe';
import { MatDialogModule } from '@angular/material/dialog';

const modules = [
  CommonModule,
  VdsLibModule,
  RouterModule,
  A11yModule,
  ReactiveFormsModule,
  FormsModule,
  HttpClientModule,
  NgxGraphModule,
  MatDialogModule,
  MatTooltipModule
];

const components = [
  OverlayComponent,
  FooterComponent,
  NavigationComponent,
  HeaderComponent,
  PanelComponent,
  ShowColumnsComponent,
  DetailViewComponent,
  SearchTableComponent,
  ShuttleBoxComponent,
  AlertBoxComponent,
  StatusComponent,
  DialogComponent,
  TimePickerComponent,
  CommentsModalComponent,
  SiteMapComponent,
  ControlConverterPipe
];

@NgModule({
  declarations: components,
  imports: modules,
  exports: [
    ...modules,
    ...components
  ],
})
export class SharedModule { }
