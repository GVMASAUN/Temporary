import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ButtonIconType } from '@visa/vds-angular';

@Component({
  selector: 'app-requirements',
  templateUrl: './requirements.component.html',
  styleUrls: ['./requirements.component.scss']
})
export class RequirementsComponent implements OnInit {
  ButtonIconType = ButtonIconType;

  @HostListener("window:keyup.esc")
  onKeyUp(): void {
    this.dialogRef.close();
  }

  constructor(public dialogRef: MatDialogRef<RequirementsComponent>) { }

  ngOnInit(): void { }
}
