import { AlertType } from "@visa/vds-angular";
import { VisaIcon } from "src/app/core/constants";
import { ResponseError } from "src/app/core/models/pagination-response.model";

export enum AlertMode {
    FULL_SCREEN,
    RESTRICTED_SCREEN
}

export const AlertIcon = {
    [AlertType.ERROR]: VisaIcon.ERROR,
    [AlertType.SUCCESS]: VisaIcon.SUCCESS,
    [AlertType.INFO]: VisaIcon.INFO,
    [AlertType.WARNING]: VisaIcon.WARNING
}

export class AlertConfig {
    title: null | string = null;
    message: null | string | string[] = null;
    type!: AlertType;
    mode?: AlertMode = AlertMode.RESTRICTED_SCREEN;
    responseErrors?: null | ResponseError[];
}