import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { UserListComponent } from './list/user-list.component';
import { CommunityListComponent } from './manage/details/community-list/community-list.component';
import { UserDetailsComponent } from './manage/details/user-details.component';
import { UserHistoryComponent } from './manage/history/user-history.component';
import { ManageUserComponent } from './manage/manage-user.component';
import { UsersRoutingModule } from './users-routing.module';


@NgModule({
  declarations: [
    ManageUserComponent,
    UserDetailsComponent,
    UserHistoryComponent,
    CommunityListComponent,
    UserListComponent
  ],
  imports: [
    SharedModule,
    UsersRoutingModule
  ]
})
export class UsersModule { }
