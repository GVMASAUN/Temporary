export type FieldType =
    | "checkbox"
    | "radio"
    | "date"
    | "input"
    | "textArea";




export class Field {
    key!: string;
    label!: string;
    type?: FieldType;

    constructor(key: string, label: string, type?: FieldType) {
        this.key = key;
        this.label = label;

        if (type) {
            this.type = type;
        }
    }
}
