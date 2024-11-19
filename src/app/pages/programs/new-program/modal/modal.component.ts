import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonColor, DialogService } from '@visa/vds-angular';
import { HttpService } from 'src/app/services/http/http.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  buttonColor = ButtonColor;

  constructor(
    private dialogService: DialogService,
    private fb: FormBuilder,
    private http: HttpService,
    private router: Router
  ) {}

  newProgramForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    type: ['1'],
    collection: ['']
  });

  isLoading = false;
  errMsg = '';

  ngOnInit(): void {}

  addNewProgram(nextPage: boolean) {
    this.isLoading = true;
    const data = this.newProgramForm.getRawValue();

    let sendingData = {
      communityCode: 'GAPCL',
      programStageId: 0,
      programId: null,
      programName: data.name,
      programType: data.type,
      programDescription: data.description,
      generalEligibleAccountsId: null,
      programBudget: null,
      segmentEnabled: false,
      eligibleAccountsSegmentId: null,
      programLevelActionEnabled: false,
      epmResponseFlowEnabled: false,
      programStartDate: null,
      programEndDate: null,
      statusCode: 2
    };
    this.http.post('api/program/program', sendingData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        res = JSON.parse(res.body);

        if (res.statusCode == 200) {
          this.dialogService.close({
            status: nextPage ? 'basicsPage' : 'proceed',
            res: res
          });
        } else {
          this.errMsg = res.errors
            .map((err: any) => err.errorMessage)
            .join(', ');
        }
      },
      error: err => {
        this.isLoading = false;
        this.errMsg = err.error;
        console.log(err);
      }
    });
  }

  close() {
    this.dialogService.close({ status: 'close' });
  }
}
