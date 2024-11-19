import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonColor, ButtonIconType } from '@visa/vds-angular';
import { VisaIcon } from 'src/app/core/constants';
import { SearchTableColumn } from 'src/app/shared/search-table/search-table.model';

@Component({
  selector: 'app-event-group-errors',
  templateUrl: './event-group-errors.component.html',
  styleUrls: ['./event-group-errors.component.scss']
})
export class EventGroupErrorsComponent {
  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  VisaIcon = VisaIcon;

  columns: SearchTableColumn[] = [
    {
      key: 'errorCode',
      label: 'Error Code',
      sortable: false
    },
    {
      key: 'errorMessage',
      label: 'Error Message',
      sortable: false
    },
    {
      key: 'targetId',
      label: 'Target ID',
      sortable: false
    }
  ]

  constructor(
    private dialogRef: MatDialogRef<EventGroupErrorsComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogConfig: any
  ) { }

  close() {
    this.dialogRef.close();
  }
}
