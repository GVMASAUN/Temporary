import { Component, Input } from '@angular/core';
import { ProgressSpinnerService } from './progress-spinner.service';
import { SpinnerSize } from '@visa/vds-angular';

@Component({
    selector: 'app-progress-spinner',
    templateUrl: './progress-spinner.component.html',
    styleUrls: ['./progress-spinner.component.scss']
})

export class ProgressSpinnerComponent {
    @Input()
    size: SpinnerSize = SpinnerSize.LARGE;

    constructor(private progressSpinnerService: ProgressSpinnerService) { }

    getSpinnerVisibility(): boolean {
        return this.progressSpinnerService.getProgressSpinnerVisibilty();
    }
}