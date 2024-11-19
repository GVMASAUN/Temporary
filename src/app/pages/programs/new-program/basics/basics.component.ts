import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonColor } from '@visa/vds-angular';
import { HttpService } from 'src/app/services/http/http.service';

@Component({
  selector: 'app-basics',
  templateUrl: './basics.component.html',
  styleUrls: ['./basics.component.scss']
})
export class BasicsComponent implements OnInit {
  buttonColor = ButtonColor;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpService,
    private fb: FormBuilder
  ) {}

  stageId = -1;
  formData = this.fb.group({
    programName: ['Groupon RT', Validators.required],
    programDescription: '',
    generalEligibleAccountsId: '',
    programBudget: '',
    epmResponseFlowEnabled: false,
    programTypeName: 'Realtime',

    baseStucture: '',

    segmentEnabled: false,
    eligibleAccountsSegmentId: null,
    programLevelActionEnabled: false
    // statusCode: ''
  });

  ngOnInit(): void {
    this.stageId = parseInt(
      this.router.url
        .split('/')
        .slice(-2, -1)
        .pop() || '-1'
    );

    this.getData();
  }

  getData() {
    this.http.get(`api/program/program/${this.stageId}`).subscribe({
      next: (res: any) => {
        res.body = JSON.parse(res.body);
        this.formData.patchValue(res.body.program);
      },
      error: err => {
        console.log(err);
      }
    });
  }

  updateData() {
    let sendingData = {
      ...this.formData.getRawValue(),
      epmResponseFlowEnabled: !!this.formData.get('epmResponseFlowEnabled')
    };

    this.http
      .put(`api/program/program/${this.stageId}`, sendingData)
      .subscribe({
        next: (res: any) => {
          res.body = JSON.parse(res.body);
          this.router.navigate(['../../'], {
            relativeTo: this.route,
            queryParamsHandling: 'merge'
          });
        },
        error: err => {
          console.log(err);
        }
      });
  }
}
