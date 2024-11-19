import { Observable } from "rxjs";
import { PaginationResponse } from "src/app/core/models/pagination-response.model";
import { WorkflowConfirmDialogComponent } from "./workflow-confirm-dialog.component";
import { DialogButton } from "src/app/core/dialog/dialog.model";

export class ConfirmPayload {
    comment: string | null = null;
}

export interface WorkflowConfirmDialogConfig {
    title: string;
    dialogActions?: DialogButton[];

    confirm: (comment: string) => Observable<boolean>
}