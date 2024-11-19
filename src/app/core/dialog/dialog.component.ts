import { Component, Inject, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonColor, ButtonIconType } from '@visa/vds-angular';
import { Subject, takeUntil } from 'rxjs';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { Utils } from 'src/app/services/utils';
import { DialogButton, DialogConfig, DialogIcon, DialogType } from './dialog.model';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input()
  title!: string;

  @Input()
  message!: string;

  @Input()
  type!: DialogType;

  @Input()
  buttonDirection: 'left' | 'right' | 'reverse' | 'center' = 'center';

  @Input()
  showProgressBar: boolean = false;

  @Input()
  buttons?: DialogButton[] = [];


  @Input()
  close: Function = () => {
    this.dialogRef?.close();
  }

  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  DialogIcon = DialogIcon;

  protected dialogContent!: TemplateRef<any>;

  constructor(
    private dialogRef: MatDialogRef<DialogComponent>,
    private viewContainerRef: ViewContainerRef,
    private dialogService: DialogService,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: DialogConfig<any>
  ) {
    const dialogConfigData: DialogConfig<any> = this.dialogConfig;

    this.title = dialogConfigData?.title || this.title;
    this.message = dialogConfigData?.message || this.message;
    this.buttons = dialogConfigData?.buttons || this.buttons;
    this.buttonDirection = dialogConfigData?.buttonDirection || this.buttonDirection;
    this.dialogContent = dialogConfigData?.dialogContent!;
    this.type = dialogConfigData?.type!;

    if (Utils.isNotNull(dialogConfigData?.showProgressBarEmitter)) {
      dialogConfigData.showProgressBarEmitter!.pipe(takeUntil(this.destroy$)).subscribe({
        next: (result: boolean) => {
          this.showProgressBar = result;
        }
      });
    }

    this.dialogService.setDialogEventListeners(
      this.dialogRef,
      () => { this.close(); }
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }
}
