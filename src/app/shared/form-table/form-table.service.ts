import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class FormTableService {

    constructor() {}

    public parseListToModelType<T>(modelType: { new (): T }, inputList: any[]): T[] {
        return inputList.map(item => {
            const modelInstance = new modelType();
            return { ...modelInstance, ...item };
        });
    }
}