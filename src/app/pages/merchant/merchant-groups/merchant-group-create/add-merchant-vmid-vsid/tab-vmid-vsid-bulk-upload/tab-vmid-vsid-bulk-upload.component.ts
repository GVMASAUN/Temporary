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
  selector: 'app-tab-vmid-vsid-bulk-upload',
  templateUrl: './tab-vmid-vsid-bulk-upload.component.html',
  styleUrls: ['./tab-vmid-vsid-bulk-upload.component.scss']
})
export class TabVmidVsidBulkUploadComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;

  showTableInput: boolean = false;
  addBinBtn: boolean = true;
  globalAlertShown: boolean = false;
  initUploadFileSelector: boolean = true;

  vsids: string = EMPTY;

  binCaid: any[] = [];

  formData = new FormData();

  vmidVsidCombinations = this.fb.group({
    combinations: [EMPTY, Validators.required],
    exclusions: [EMPTY],
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
    this.formData.append('merchantGroupType', 'MerchantInfo');

    if (type === 'vmid-combinations') {
      this.formData.append('merchants', this.merchantGroupService.parseCombinations(this.vmidVsidCombinations.value.combinations));
    }

    this.dialog.open(AddMerchantConfirmDialogComponent, {
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
    this.http.get(`templates/vmid_vsid_import.csv`).subscribe({
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

    if (this.vmidVsidCombinations.valid) {
      this.uploadCombinations();
    }
  }

  uploadFile() {
    this.openConfirmDialog('vmid-file');
  }

  uploadCombinations() {
    this.openConfirmDialog('vmid-combinations');
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
      this.formData.delete('file');
      this.formData.delete('merchantGroupName');
      let removeTheAlert = true;
      if (!event?.payload?.files) {
        return;
      }

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
      this.globalAlertShown = false;
      let errorFoundAfterCompleteAll = false;
      event.payload.forEach((f: { hasError: any }) => {
        if (f.hasError) {
          errorFoundAfterCompleteAll = true;
        }
      });
      if (errorFoundAfterCompleteAll) {
        // setTimeout(() => {
        //   this.globalAlertCount += 1;
        //   this.globalAlertShown = true;
        //   this.globalAlertType = AlertType.WARNING;
        //   this.globalAlertMessage = "Some files couldn't upload.";
        // }, 300);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

