import { MatDialogRef } from "@angular/material/dialog";
import { CommentsModalComponent } from "./comments-modal.component";
import { Observable } from "rxjs";
import { PaginationResponse } from "src/app/core/models/pagination-response.model";

export enum EntityType {
    EVENT = 'event',
    EVENT_GROUP = 'event group',
    EVENT_GROUP_TEMPLATE = 'event group template'
}

export class CommentModel {
    id: number | null = null;
    entityId: number | null = null;
    parentEntityId: number | null = null;
    entityType: number | null = null;
    workflowVersionNumber: number | null = null;

    communityCode: string | null = null;
    communityBID: string | null = null;
    comment: string | null = null;
    commentCreatedDate: string | null = null;
    createdUserId: string | null = null;
    createdUserFullName: string | null = null;
    createdDate: string | null = null;
}

export class CommentModalConfig {
    dialogTitle!: string;

    saveComments!: boolean;

    entityType!: EntityType;

    callback: Observable<PaginationResponse<Array<CommentModel>>>;

    onSaveCallback: (comment: string) => any;
    onCloseCallback: (dialogRef: MatDialogRef<CommentsModalComponent>) => any;

    constructor(
        callback: Observable<PaginationResponse<Array<CommentModel>>>,
        onSaveCallback: (comment: string) => any,
        onCloseCallback: (dialogRef: MatDialogRef<CommentsModalComponent>) => any,
        entityType: EntityType,
        dialogTitle: string,
        saveComments: boolean
    ) {
        this.callback = callback;
        this.onSaveCallback = onSaveCallback;
        this.onCloseCallback = onCloseCallback;
        this.entityType = entityType,
            this.dialogTitle = dialogTitle,
            this.saveComments = saveComments
    }
}