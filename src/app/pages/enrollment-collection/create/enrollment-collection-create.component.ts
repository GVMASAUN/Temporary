import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { TabsOrientation, ButtonColor } from '@visa/vds-angular';
import { EnrollmentCollection, EnrollmentCollectionResponse, EnrollmentCollectionStep, Tenant } from '../enrollment-collection.model';
import { Module } from 'src/app/core/models/module.model';
import { ActivatedRoute, Router } from '@angular/router';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { SUCCESS_CODE } from 'src/app/core/constants';
import { CustomFormGroup, FormBuilder } from 'src/app/services/form-service/form.service';
import { EnrollmentCollectionDetailComponent } from '../shared/enrollment-collection-detail/enrollment-collection-detail.component';
import { EnrollmentCollectionService } from 'src/app/services/enrollment-collection/enrollment-collection.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';
import { Mode } from 'src/app/core/models/mode.model';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';

@Component({
    selector: 'app-enrollment-collection-create',
    templateUrl: './enrollment-collection-create.component.html'
})
export class EnrollmentCollectionCreateComponent implements OnInit, OnDestroy {
    @ViewChild('detailTab')
    enrollmentDetailTab!: EnrollmentCollectionDetailComponent;

    @Input()
    createByPwp: boolean = false;

    @Output()
    onCreate: EventEmitter<EnrollmentCollection> = new EventEmitter();

    TabsOrientation = TabsOrientation;
    ButtonColor = ButtonColor;
    EnrollmentCollectionStep = EnrollmentCollectionStep;

    readonly mode = Mode.Create;
    readonly ENROLLMENT_COLLECTION = Module.ENROLLMENT_COLLECTION;
    readonly viewName: string = 'create-enrollment-collection';

    enrollmentCollectionFormGroup: CustomFormGroup<EnrollmentCollection> = this.formBuilder.group(new EnrollmentCollection());

    selectedTabIndex: number = 0;

    communityCode: string = this.route.snapshot.queryParams['client'];
    backUrl: string = this.router.getCurrentNavigation()?.extras.state?.['backUrl'];

    initialized: boolean = false;

    tabs: ReadonlyArray<string> = [
        EnrollmentCollectionStep.DETAILS
    ];

    getTabId: Function = this.functionService.getTabId;
    getTabLabelledById: Function = this.functionService.getTabLabelledById;


    get enrollmentCollection(): EnrollmentCollection {
        return this.enrollmentCollectionFormGroup.getRawValue() as EnrollmentCollection;
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private functionService: FunctionsService,
        private navStatusService: NavStatusService,
        private formBuilder: FormBuilder,
        private alertService: ToggleAlertService,
        private viewContainerRef: ViewContainerRef,
        private enrollmentCollectionService: EnrollmentCollectionService,
        private elementRef: ElementRef
    ) { }

    private init(): void {
        this.navStatusService.setOverlayStatus(true);
        this.initialized = true;
    }

    protected handleCancel() {
        if (!!this.backUrl) {
            this.router.navigateByUrl(this.backUrl);
        } else {
            this.enrollmentCollectionService.returnToEnrollmentCollectionListPage();
        }
    }

    ngOnInit(): void {
        this.init();
    }


    saveEnrollmentCollection(isSaveAndExit: boolean = false): void {
        const isFormValid = this.enrollmentDetailTab.pathValuesToEnrollmentFormGroup();

        if (isFormValid) {

            this.enrollmentCollectionService.saveEnrollmentCollection(this.enrollmentCollection).subscribe({
                next: (response: EnrollmentCollectionResponse<EnrollmentCollection>) => {

                    if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
                        this.alertService.showSuccessMessage('Enrollment Collection was successfully created.');

                        if (this.createByPwp) {
                            this.onCreate.emit(response.responseData);
                        } else {
                            if (isSaveAndExit) {
                                this.enrollmentCollectionService.returnToEnrollmentCollectionListPage();
                            } else {
                                this.enrollmentCollectionService.navigateToEnrollmentCollectionManagePage(response.responseData.enrollmentCollectionId!, response.responseData.entityId!);
                            }
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