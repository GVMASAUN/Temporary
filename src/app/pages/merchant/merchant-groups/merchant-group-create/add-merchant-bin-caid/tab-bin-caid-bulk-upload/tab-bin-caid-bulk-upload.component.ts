import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonColor,
  ButtonIconType,
  UPLOAD_STATUS,
  UploadEvent
} from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { EMPTY } from 'src/app/core/constants';
import { HttpService } from 'src/app/services/http/http.service';
import { MerchantGroupService } from 'src/app/services/merhant-group/merchant-group.service';
import { CreateDataService } from 'src/app/services/private/create-data.service';
import { AddMerchantConfirmDialogComponent } from '../../add-merchant-confirm-dialog/add-merchant-confirm-dialog.component';

@Component({
  selector: 'app-tab-bin-caid-bulk-upload',
  templateUrl: './tab-bin-caid-bulk-upload.component.html',
  styleUrls: ['./tab-bin-caid-bulk-upload.component.scss']
})
export class TabBinCaidBulkUploadComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;

  showTableInput: boolean = false;
  addBinBtn: boolean = true;
  globalAlertShown: boolean = false;
  initUploadFileSelector: boolean = true;

  caids: string = EMPTY;

  binCaid: any[] = [];

  formData = new FormData();

  binCaidCombinations = this.fb.group({
    combinations: [EMPTY, Validators.required],
    comment: [EMPTY]
  });

  merchantDetails = JSON.parse(
    localStorage.getItem('selectedMerchant') || '{}'
  );

  constructor(
    private fb: UntypedFormBuilder,
    private route: ActivatedRoute,
    private http: HttpService,
    private dataService: CreateDataService,
    private dialog: MatDialog,
    private merchantGroupService: MerchantGroupService
  ) { }

  private openConfirmDialog(type: string) {
    let data = this.dataService.createMerchantData.getValue();
    let merchantName = data?.name || data?.merchantGroupName || EMPTY;

    if (!merchantName)
      merchantName = this.route.snapshot.params['id'] || 'NotFound';
    this.formData.append('merchantGroupName', merchantName);
    this.formData.append('communityCode', this.merchantDetails?.communityCode);
    this.formData.append('merchantGroupType', 'AcquirerInfo');

    if (type === 'combinations') {
      this.formData.append(
        'merchants',
        this.merchantGroupService.parseCombinations(this.binCaidCombinations.value.combinations)
      );
    }

    this.dialog.open(
      AddMerchantConfirmDialogComponent, {
      ariaLabel: 'add-merchants-dialog',
      hasBackdrop: true, disableClose: true,
      data: {
        type: type,
        formData: this.formData
      }
    }).afterClosed().subscribe(response => {
      if (!!response && (response?.fileUploadSuccess === false)) {

        this.handleUpload({ payload: null, type: UPLOAD_STATUS.REMOVE });

        this.initUploadFileSelector = false;

        setTimeout(() => {
          this.initUploadFileSelector = true;
        }, 10);
      }
    });
  }

  ngOnInit(): void { }

  templateDownload() {
    this.http.get(`templates/bin_caid_import.csv`).subscribe({
      next: (res: any) => {
        let fileName: string = res.headers
          .get('content-disposition')
          .split('=')
          .pop();

        let blob = new Blob([res.body], { type: 'text/csv' });

        let downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.setAttribute('download', fileName);
        downloadLink.click();
      },
      error: err => {
        console.log(err);
      }
    });
  }

  addMerchants() {
    if (!!this.formData.get('file')) {
      this.uploadFile();
    }

    if (this.binCaidCombinations.valid) {
      this.uploadCombinations();
    }
  }

  uploadFile() {
    this.openConfirmDialog('file');
  }

  uploadCombinations() {
    this.openConfirmDialog('combinations');
  }

  handleItemDownload(event: any) {
    console.log('handleItemDownload', event);
  }

  handleItemDirDelete(event: any) {
    console.log('handleItemDirDelete', event);
  }

  handleUpload(event: UploadEvent) {
    if (event.type === UPLOAD_STATUS.ADD) {
      const fileMap = event.payload;

      event.payload.forEach((v: any) => this.formData.append('file', v.file));
    }
    if (event.type === UPLOAD_STATUS.REMOVE) {
      // we can hide the global alert if we've removed the last errored file upload
      let removeTheAlert = true;
      this.formData.delete('file');
      if (!event?.payload?.files) {
        return;
      }
      // if we find any errored files remaining, we'll keep the global alert
      event.payload.files.forEach((f: { hasError: any }) => {
        if (f.hasError) {
          removeTheAlert = false;
        }
      });
      if (removeTheAlert) {
        this.globalAlertShown = false;
      }
    }
    if (event.type === UPLOAD_STATUS.COMPLETE_ALL) {
      // clear the global alert if it's being shown.
      // even if this action results in an error--we want that alert to re-trigger
      // so that screen readers pick it up again.
      this.globalAlertShown = false;
      // iterate through each file in the event payload, and if any file
      // has an error we'll render the global alert
      let errorFoundAfterCompleteAll = false;
      event.payload.forEach((f: { hasError: any }) => {
        if (f.hasError) {
          errorFoundAfterCompleteAll = true;
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
