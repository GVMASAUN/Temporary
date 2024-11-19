import { DialogConfig } from "@angular/cdk/dialog";
import { ComponentType } from "@angular/cdk/portal";
import { Injectable, TemplateRef } from "@angular/core";
import { MatDialog, MatDialogConfig, MatDialogRef } from "@angular/material/dialog";
import { Observable, map } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(
    public dialog: MatDialog
  ) { }

  public setDialogEventListeners(
    dialogRef: MatDialogRef<any>,
    callback?: () => void
  ): Observable<void> {
    return dialogRef.keydownEvents().pipe(
      map((event) => {
        if (event.key === "Escape") {
          if (!!callback) {
            callback();
          } else {
            dialogRef.close();
          }
        }
      })
    );
  }

  public openDialog<T>(
    templateRef: ComponentType<any> | TemplateRef<any>,
    config: MatDialogConfig<DialogConfig<T>>
  ): MatDialogRef<any, any> {
    return this.dialog.open(templateRef, {
      hasBackdrop: true,
      disableClose: true,
      ...config
    });
  }
}