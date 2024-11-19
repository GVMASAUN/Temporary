import { Component, OnInit } from '@angular/core';
import { DialogService } from '@visa/vds-angular';

@Component({
  selector: 'app-prequisites-modal',
  templateUrl: './prequisites-modal.component.html',
  styleUrls: ['./prequisites-modal.component.scss']
})
export class PrequisitesModalComponent implements OnInit {
  setupData: any[] = [];
  constructor(private dialogService: DialogService) {}

  ngOnInit(): void {
    this.setupData = this.dialogService.userConfigData;
  }

  close() {
    this.dialogService.close();
  }
}
