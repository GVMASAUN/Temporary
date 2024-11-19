import { ButtonColor } from "@visa/vds-angular";

export class PanelTab {
    label!: string;
    icon?: string;
    click?: Function;
}

export class PanelAction {
    label!: string;
    buttonColor!: ButtonColor;
    click?: Function;
    disabled?: Function;
    hidden?: Function;
}

export class Panel {
}
