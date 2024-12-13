import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ButtonColor, TabsOrientation } from '@visa/vds-angular';
import { EnrollmentCollection, EnrollmentCollectionResponse, EnrollmentCollectionStep } from '../enrollment-collection.model';
import { ActivatedRoute } from '@angular/router';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { Module } from 'src/app/core/models/module.model';
import { CustomFormGroup, FormBuilder } from 'src/app/services/form-service/form.service';
import { EnrollmentCollectionService } from 'src/app/services/enrollment-collection/enrollment-collection.service';
import { SUCCESS_CODE } from 'src/app/core/constants';
import { Utils } from 'src/app/services/utils';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { EnrollmentCollectionDetailComponent } from '../shared/enrollment-collection-detail/enrollment-collection-detail.component';
import { Mode } from 'src/app/core/models/mode.model';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { UserRole } from 'src/app/core/models/user.model';
import { AuthorizationService } from 'src/app/services/authorization.service';

@Component({
    selector: 'app-enrollment-collection-manage',
    templateUrl: './enrollment-collection-manage.component.html'
})
export class EnrollmentCollectionMangeComponent implements OnInit, OnDestroy {
    @ViewChild('detailTab')
    enrollmentDetailTab!: EnrollmentCollectionDetailComponent;

    TabsOrientation = TabsOrientation;
    ButtonColor = ButtonColor;
    EnrollmentCollectionStep = EnrollmentCollectionStep;

    readonly mode = Mode.Manage;
    readonly ENROLLMENT_COLLECTION = Module.ENROLLMENT_COLLECTION;
    readonly viewName: string = 'manage-enrollment-collection';

    enrollmentCollectionFormGroup: CustomFormGroup<EnrollmentCollection> = this.formBuilder.group(new EnrollmentCollection());

    selectedTabIndex: number = 0;

    enrollmentCollectionId: string = this.route.snapshot.params['id'];
    tenantId: string = this.route.snapshot.params['tenantId'];

    initialized: boolean = false;

    tabs: ReadonlyArray<string> = [
        EnrollmentCollectionStep.DETAILS
    ];

    getTabId: Function = this.functionService.getTabId;
    getTabLabelledById: Function = this.functionService.getTabLabelledById;

    get enrollmentCollection(): EnrollmentCollection {
        return this.enrollmentCollectionFormGroup.getRawValue() as EnrollmentCollection;
    }

    get editable(): boolean {
        return (
            (this.authorizationService?.getUserRole() !== UserRole.CLIENT_READ_ONLY) &&
            !this.enrollmentCollection.activeEnrollmentCollection
        );
    }


    constructor(
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private functionService: FunctionsService,
        private navStatusService: NavStatusService,
        private alertService: ToggleAlertService,
        private viewContainerRef: ViewContainerRef,
        private authorizationService: AuthorizationService,
        public enrollmentCollectionService: EnrollmentCollectionService,
        private elementRef: ElementRef
    ) { }

    private init(): void {
        this.navStatusService.setOverlayStatus(true);
        this.getEnrollmentCollection();
    }

    private getEnrollmentCollection(): void {
        this.initialized = false;

        this.enrollmentCollectionService.getEnrollmentCollection(this.enrollmentCollectionId, this.tenantId).subscribe({
            next: (response: EnrollmentCollectionResponse<EnrollmentCollection>) => {

                if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
                    this.enrollmentCollectionFormGroup.patchValue(response.responseData);
                    this.initialized = true;
                } else {
                    this.alertService.showResponseErrors(response.errors);
                }
            },
            error: error => {
                this.alertService.showError(error);
                console.log(error);
            }
        });
    }

    ngOnInit(): void {
        this.init();
    }

    updateEnrollmentCollection(isSaveAndExit: boolean = false): void {
        const isFormValid = this.enrollmentDetailTab.pathValuesToEnrollmentFormGroup();

        if (isFormValid) {
            let enrollmentCollectionData = this.enrollmentCollection;

            this.enrollmentCollectionService.updateEnrollmentCollection(enrollmentCollectionData).subscribe({
                next: (response: EnrollmentCollectionResponse<EnrollmentCollection>) => {

                    if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
                        this.alertService.showSuccessMessage('Enrollment Collection successfully updated.');

                        if (isSaveAndExit) {
                            this.enrollmentCollectionService.returnToEnrollmentCollectionListPage();
                        } else {
                            this.init();
                        }
                    } else {
                        this.alertService.showResponseErrors(response.errors);
                    }
                },
                error: error => {
                    this.alertService.showError(error);
                    console.log(error);
                }
            });
        } else {
            Utils.setFocusOnFirstInvalid(this.elementRef);
        }
    }

    ngOnDestroy(): void {

        GarbageCollectorService.clearDetachedDOMElements(
            this,
            this.viewContainerRef
        )
    }
}