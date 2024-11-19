import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ProgressSpinnerService {

    private showProgressSpinner: boolean = true;

    constructor() { }

    setProgressSpinnerVisibilty(showSpinner: boolean): void {
        this.showProgressSpinner = showSpinner;
    }

    getProgressSpinnerVisibilty(): boolean {
        return this.showProgressSpinner;
    }
}