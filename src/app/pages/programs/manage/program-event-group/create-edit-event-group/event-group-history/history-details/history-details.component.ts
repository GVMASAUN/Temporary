import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ButtonColor, ButtonIconType } from '@visa/vds-angular';

@Component({
  selector: 'app-history-details',
  templateUrl: './history-details.component.html',
  styleUrls: ['./history-details.component.scss']
})
export class HistoryDetailsComponent implements OnInit {
  buttonColor = ButtonColor;
  buttonIconType = ButtonIconType;

  @HostListener("window:keyup.esc")
  onKeyUp(): void {
    this.close();
  }

  constructor(
    private dialogRef: MatDialogRef<HistoryDetailsComponent>
  ) { }

  ngOnInit(): void { }

  close() {
    this.dialogRef.close();
  }
}
