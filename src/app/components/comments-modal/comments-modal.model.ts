import { MatDialogRef } from "@angular/material/dialog";
import { CommentsModalComponent } from "./comments-modal.component";

export enum EntityType {
    EVENT = 'event',
    EVENT_GROUP = 'event group',
    EVENT_GROUP_TEMPLATE = 'event group template'
}

export class CommentModel {
    communityCode: string | null = null;
    communityBID: string | null = null;
    id: number | null = null;
    entityId: number | null = null;
    parentEntityId: number | null = null;
    entityType: number | null = null;
    comment: string | null = null;
    workflowVersionNumber: number | null = null;
    commentCreatedDate: string | null = null;
    createdUserId: string | null = null;
    createdUserFullName: string | null = null;
    createdDate: string | null = null;
}

export class CommentModalConfig {
    callback: Function = () => { };
    onSaveCallback: Function = (comment: string) => { };
    onCloseCallback: Function = (dialogRef: MatDialogRef<CommentsModalComponent>) => { };
    entityType!: EntityType;
    dialogTitle!: string;
    saveComments!: boolean;

    constructor(callback: Function, onSaveCallback: Function, onCloseCallback: Function, entityType: EntityType, dialogTitle: string, saveComments: boolean) {
        this.callback = callback;
        this.onSaveCallback = onSaveCallback;
        this.onCloseCallback = onCloseCallback;
        this.entityType = entityType,
        this.dialogTitle = dialogTitle,
        this.saveComments = saveComments
    }
}