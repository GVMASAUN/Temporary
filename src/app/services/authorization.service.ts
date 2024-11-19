import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User, UserRole } from '../core/models/user.model';
import { Store, Stores } from './stores/store.service';
import { ACTIVE_TAB_STORE_KEY } from '../core/constants';
import { ApiConfigService } from './api-config.service';

export class State {
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService extends Store<State> {
  private URL_CONFIG: any;

  constructor(
    private httpClient: HttpClient,
    private env: ApiConfigService
  ) {
    super(new State());
    this.env.getConfigLoaded().subscribe(loaded => {
      if (loaded) {
        this.URL_CONFIG = {
          base: `${this.env.getUrls().baseUrl}api/user/`,
          userDetails: 'getUserDetails',
        };
      }
    });
  }

  createUserSession(user: any) {
    this.setState({
      user: user
    });
  }

  readUserSession() {
    return this.getItem('user');
  }

  removeUserSession() {
    this.removeItem('user');
  }

  clearUserSession() {
    Stores.map(st => st.clear());

    localStorage.clear();
  }
  // readUserCookie() {
  //   const value = `; ${document.cookie}`;

  //   const parts = value.split(`; JSESSIONID=`);
  //   if (parts.length === 2) {
  //     let value = parts
  //       .pop()!
  //       .split(';')
  //       .shift();

  //     return value;
  //   }

  //   return;
  // }
  // removeUserCookie() {
  //   document.cookie = `JSESSIONID=;Expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`;
  // }

  validateSession() {
    return this.httpClient.get(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.userDetails}`,
    );
  }

  getUserRole(): UserRole {
    return this.state.user?.userRole!;
  }

  getUserId(): string {
    return this.state.user?.userId!;
  }

  getUser(): User {
    return this.state.user!;
  }

}


