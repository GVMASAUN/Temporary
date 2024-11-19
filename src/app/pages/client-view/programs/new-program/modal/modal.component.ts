import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonColor, DialogService } from '@visa/vds-angular';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  buttonColor = ButtonColor;

  constructor(private dialogService: DialogService, private fb: FormBuilder) {}

  newProgramForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    type: ['1'],
    collection: ['']
  });

  ngOnInit(): void {}

  proceed() {
    this.dialogService.close({
      status: 'proceed',
      res: this.newProgramForm.getRawValue()
    });
  }
  close() {
    this.dialogService.close({ status: 'close' });
  }
}
