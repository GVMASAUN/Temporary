import { Component, OnInit } from '@angular/core';
import { ButtonColor, DialogService } from '@visa/vds-angular';

@Component({
  selector: 'app-confirm-assign-modal',
  templateUrl: './confirm-assign-modal.component.html',
  styleUrls: ['./confirm-assign-modal.component.scss']
})
export class ConfirmAssignModalComponent implements OnInit {
  buttonColor = ButtonColor;

  constructor(private dialogService: DialogService) {}

  ngOnInit(): void {}

  confirm() {
    this.dialogService.close({ action: 'confirm' });
  }
  close() {
    this.dialogService.close({ action: 'close' });
  }
}
