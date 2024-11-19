import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ButtonColor, ButtonIconType, ButtonType } from '@visa/vds-angular';
import { ApiConfigService } from 'src/app/services/api-config.service';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { HttpService } from 'src/app/services/http/http.service';
import { LoginService } from 'src/app/services/login/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  ButtonType = ButtonType;
  ButtonIconType = ButtonIconType;
  ButtonColor = ButtonColor;

  passwordSVG = 'password-show';
  isPassHide = true;
  showErr = false;
  isLoading = false;

  loginForm!: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private http: HttpService,
    private auth: AuthorizationService,
    private loginService: LoginService,
    private httpClient: HttpClient,
    private env: ApiConfigService
  ) {
    this.loginForm = this.formBuilder.group({
      username: [undefined, Validators.required],
      password: [undefined, Validators.required]
    });
  }

  ngOnInit(): void {
    this.auth.clearUserSession();

    window.location.href=this.env.getUrls().baseUrl + "login.html?redirect=true";

    //this.httpClient.get(this.env.getUrls().baseUrl + "login.html",
    //  {
    //    responseType: 'text'
    //  }).subscribe(res => {
    //    document.getElementById('login-html')!.innerHTML = res;

    //  });
  }

  showPassword() {
    this.isPassHide = !this.isPassHide;
    this.passwordSVG = this.isPassHide ? 'password-show' : 'password-hide';
  }

  doLogin() {
    this.isLoading = true;

    let formData = new FormData();

    formData.append('u', this.loginForm.get('username')!.value);
    formData.append('p', this.loginForm.get('password')!.value);

    this.loginForm.reset();

    this.http.post('login', formData, undefined, true).subscribe({
      next: res => {
        this.isLoading = false;
        if (res.url?.split('/').pop() == 'loginsuccess') {

          this.loginService.setInterval();
          // this.loginService.getUserDetails();
        } else {
          this.showErr = true;
        }
      },
      error: err => {
        console.log(err);
        this.showErr = true;
        this.isLoading = false;
      }
    });
  }
}
