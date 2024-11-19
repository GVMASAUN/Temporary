import { Injectable } from '@angular/core';
import { UserRole } from '../core/models/user.model';
import { menuConfig } from './configs/menu.config';
import { IMenuItem } from './interfaces/menu.model';
import { Utils } from './utils';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  constructor() { }

  getRoleWiseMenu(role: UserRole): IMenuItem[] {
    return Utils.sortArray(menuConfig[role], 'rank');
  }
}
