import { EventEmitter, TemplateRef } from "@angular/core";
import { ButtonColor } from "@visa/vds-angular";
import { VisaIcon } from "../constants";
import { DialogComponent } from "./dialog.component";

export enum DialogType {
    CONFIRMATION,
    WARNING,
    ERROR,
    INFO,
    SUCCESS
}

export const DialogIcon = {
    [DialogType.CONFIRMATION]: VisaIcon.QUESTION,
    [DialogType.WARNING]: VisaIcon.WARNING,
    [DialogType.ERROR]: VisaIcon.ERROR,
    [DialogType.INFO]: VisaIcon.INFO,
    [DialogType.SUCCESS]: VisaIcon.SUCCESS
}



export class DialogButton {
    label!: string;
    color: ButtonColor = ButtonColor.NONE;
    click!: (component: DialogComponent) => void;
    disable?: (component: DialogComponent) => boolean
}

export class DialogConfig<T> {
    title?: string;
    message?: string;
    buttonDirection?: 'left' | 'right' | 'reverse';
    buttons?: Array<DialogButton>;
    showProgressBarEmitter?: EventEmitter<boolean>;
    dialogContent?: TemplateRef<any>;
    type?: DialogType;
    data?: T;

    constructor(
        title?: string,
        message?: string,
        buttonDirection?: 'left' | 'right' | 'reverse',
        buttons?: Array<DialogButton>,
        showProgressBarEmitter?: EventEmitter<boolean>,
        dialogContent?: TemplateRef<any>,
        type?: DialogType
    ) {
        this.title = title;
        this.message = message;
        this.buttonDirection = buttonDirection;
        this.buttons = buttons;
        this.showProgressBarEmitter = showProgressBarEmitter;
        this.dialogContent = dialogContent;
        this.type = type;
    }
}
