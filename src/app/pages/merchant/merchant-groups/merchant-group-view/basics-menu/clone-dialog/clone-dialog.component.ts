import { Component, HostListener, Inject, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ButtonColor } from '@visa/vds-angular';
import { EMPTY, SUCCESS_CODE } from 'src/app/core/constants';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { HttpService } from 'src/app/services/http/http.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-clone-dialog',
  templateUrl: './clone-dialog.component.html',
  styleUrls: ['./clone-dialog.component.scss']
})
export class CloneDialogComponent implements OnInit, OnDestroy {
  ButtonColor = ButtonColor;

  @HostListener("window:keyup.esc")
  onKeyUp(): void {
    this.dialogRef.close({ action: 'close' });
  }

  constructor(
    public dialogRef: MatDialogRef<CloneDialogComponent>,
    private alertService: ToggleAlertService,
    private route: ActivatedRoute,
    private http: HttpService,
    private viewContainerRef: ViewContainerRef,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any
  ) { }

  newGroupName: string = EMPTY;
  description: string = EMPTY;

  isLoading: boolean = false;

  ngOnInit(): void { }

  handleSubmit() {
    this.isLoading = true;

    const merchantGroupArr: object[] = [];
    merchantGroupArr.push({
      name: this.newGroupName
    });

    const data = this.dialogConfig;

    const sendingData = {
      communityCode: this.route.snapshot.queryParams['client'],
      merchantGroupId: data.id,
      merchantGroups: merchantGroupArr,
      type: data.type,
      copyFromMerchantGroupName: data.groupName,
      merchantGroupDescription: this.description,
      optionalComment: data.optionalComment
    };

    this.http
      .post('api/merchantgroup/cloneMerchantGroup', sendingData)
      .subscribe({
        next: (res: any) => {
          res = JSON.parse(res.body);
          this.isLoading = false;

          if ((res.statusCode === SUCCESS_CODE) && Utils.isNull(res.errors)) {
            this.alertService.showSuccessMessage(`New group with name ${this.newGroupName} created`);

            this.dialogRef.close({
              action: 'clone',
              name: this.newGroupName,
              data: res
            });
          } else {
            this.alertService.showResponseErrors(res?.errors)
          }
        },
        error: err => {
          this.isLoading = false;
          console.log(err);
        }
      });
  }

  ngOnDestroy(): void {
    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }
}
