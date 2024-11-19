import { Component, OnInit } from '@angular/core';
import {
  ButtonColor,
  ButtonIconType,
  ComboboxType,
  DialogService
} from '@visa/vds-angular';

@Component({
  selector: 'app-assign-program-modal',
  templateUrl: './assign-program-modal.component.html',
  styleUrls: ['./assign-program-modal.component.scss']
})
export class AssignProgramModalComponent implements OnInit {
  buttonColor = ButtonColor;
  buttonIconType = ButtonIconType;
  comboboxType = ComboboxType;

  constructor(private dialogService: DialogService) {}

  programName = '';
  programList: any[] = [
    'program name 1',
    'program name 2',
    'program name 3',
    'program name 4',
    'program name 5'
  ];

  ngOnInit(): void {}

  selectOption(e: string[]) {
    this.programName = e[0];
  }

  confirm() {
    this.dialogService.close({ action: 'next', program: this.programName });
  }

  close() {
    this.dialogService.close({ action: 'close' });
  }
}
