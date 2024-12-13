import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BadgeType, ButtonColor, ButtonIconType, ComboboxType } from '@visa/vds-angular';
import { CLOSE, COMMA, CONFIRM, EMPTY, HYPHEN, QUESTION_MARK, REQUIRED_FIELD, SUCCESS_CODE, VALIDATION_FAIL_ERROR, VisaIcon } from 'src/app/core/constants';
import { DialogComponent } from 'src/app/core/dialog/dialog.component';
import { DialogConfig } from 'src/app/core/dialog/dialog.model';
import { ButtonDirection } from 'src/app/core/models/dialog-button-direction.model';
import { Mode } from 'src/app/core/models/mode.model';
import { Option } from 'src/app/core/models/option.model';
import { STATUS_BADGE_TYPE, StatusCode, StatusDesc } from 'src/app/core/models/status.model';
import { EnrollmentCollectionService } from 'src/app/services/enrollment-collection/enrollment-collection.service';
import { CustomFormGroup, CustomValidator } from 'src/app/services/form-service/form.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { DateUtils } from 'src/app/services/util/dateUtils';
import { Utils } from 'src/app/services/utils';
import { DynamicFormComponent } from 'src/app/shared/dynamic-form/dynamic-form.component';
import { FieldSpan, FormField, FormFieldType } from 'src/app/shared/dynamic-form/dynamic-form.model';
import { SearchTableComponent } from 'src/app/shared/search-table/search-table.component';
import { RowAction, SearchTableAction, SearchTableColumn, SearchTableColumnType, SortType } from 'src/app/shared/search-table/search-table.model';
import { AccountRange, AccountRanges, AccountRangesResponse, EnrollmentCollection, EnrollmentType, RANGE_FORMAT_ERROR_MESSAGE, RANGE_ORDER_ERROR_MESSAGE, Tenant, TenantType } from '../../enrollment-collection.model';

@Component({
    selector: 'app-enrollment-collection-detail',
    templateUrl: './enrollment-collection-detail.component.html',
    styleUrls: ['enrollment-collection-detail.component.scss']
})
export class EnrollmentCollectionDetailComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('timeZone')
    timeZoneTemplate!: TemplateRef<any>;

    @ViewChild('editAccountRange')
    editAccountRangeTemplate!: TemplateRef<any>;

    @ViewChild('basicsForm')
    basicsFormComponent!: DynamicFormComponent;

    @ViewChild('eligibilityForm')
    eligibilityFormComponent!: DynamicFormComponent;

    @ViewChild('editRangeForm')
    editRangeFormComponent!: DynamicFormComponent;

    @Input()
    enrollmentCollectionFormGroup!: CustomFormGroup<EnrollmentCollection>;

    @Input()
    mode!: Mode;

    @Input()
    disabled: boolean = false;


    ComboboxType = ComboboxType;
    ButtonIconType = ButtonIconType;
    ButtonColor = ButtonColor;
    BadgeType = BadgeType;
    VisaIcon = VisaIcon;
    Mode = Mode;
    EMPTY = EMPTY;
    SortType = SortType;
    TenantType = TenantType;
    StatusCode = StatusCode;
    StatusDesc = StatusDesc;
    STATUS_BADGE_TYPE = STATUS_BADGE_TYPE;



    showAccountRangeList!: boolean;

    invalidAccountRanges: number = 0;

    enrollmentCollectionId: string = this.route.snapshot.params['id'];

    tenantList!: Tenant[];

    basicsFormFields: ReadonlyArray<FormField> = [];

    eligibilityFormFields: ReadonlyArray<FormField> = [];

    editAccountRangeFormFields: ReadonlyArray<FormField> = [];

    accountRangeTableColumns: ReadonlyArray<SearchTableColumn> = [
        {
            key: 'serialNo',
            label: 'No.',
            type: SearchTableColumnType.SERIAL_NUMBER,
            sortable: false
        },
        {
            key: 'accountRange',
            label: 'Account Range',
            type: SearchTableColumnType.DEFAULT,
            mapValue: (accountRange: AccountRange, table: SearchTableComponent) => {
                return accountRange.rangeStart?.concat(' - ').concat(accountRange.rangeEnd!);
            }
        },
        {
            key: 'valid',
            label: 'Status',
            type: SearchTableColumnType.STATUS,
            showStatusIcon: true,
            mapValue: (accountRange: AccountRange, table: SearchTableComponent) => {
                return !!accountRange.valid ? StatusCode.VALID : StatusCode.INVALID;
            }
        }
    ];

    accountRangeTableActions: ReadonlyArray<SearchTableAction> = [
        {
            label: 'Delete Ranges',
            buttonColor: ButtonColor.SECONDARY,
            disabled: (table: SearchTableComponent) => {
                return !table.selection.selected.length;
            },
            click: (table: SearchTableComponent) => {
                this.openDeleteConfirmDialog(table.selection.selected);
            }
        }
    ];

    accountRangeRowActions: ReadonlyArray<RowAction> = [
        {
            icon: VisaIcon.EDIT,
            click: (accountRange: AccountRange, table: SearchTableComponent) => {
                this.openEditAccountRangeDialog(accountRange);
            },
            tooltip: () => 'Edit Range'
        },
        {
            icon: VisaIcon.DELETE,
            click: (accountRange: AccountRange, table: SearchTableComponent) => {
                const accountRanges: AccountRange[] = [accountRange];

                this.openDeleteConfirmDialog(accountRanges);
            },
            tooltip: () => 'Delete Range'
        }
    ];

    accountRangeList: AccountRange[] = [];

    readonly errorMessages = {
        default: {
            required: REQUIRED_FIELD,
            rangeFormat: RANGE_FORMAT_ERROR_MESSAGE,
            rangeOrder: RANGE_ORDER_ERROR_MESSAGE
        }
    };

    readonly accountRateEditFromErrorMessages = {
        rangeStart: {
            invalidStartRange: "Range Start should be less than from Range End"
        },
        rangeEnd: {
            invalidEndRange: "Range End should be greater than from Range Start"
        },
    }

    get enrollmentCollection(): EnrollmentCollection {
        return this.enrollmentCollectionFormGroup.getRawValue() as EnrollmentCollection;
    }

    constructor(
        private enrollmentCollectionService: EnrollmentCollectionService,
        private alertService: ToggleAlertService,
        private dialog: MatDialog,
        private viewContainerRef: ViewContainerRef,
        private route: ActivatedRoute
    ) { }

    private getParsedAccountRangeValues(value: any): string {
        return String(value || EMPTY).replace(/ /g, EMPTY).replace(/[\n\r]/g, COMMA);
    }

    private accountRangeValidator(control: AbstractControl): ValidationErrors | null {
        const value = this.getParsedAccountRangeValues(control?.value);

        // const regex = /^\d+-\d+(,\d+-\d+)*$/;
        const regex = /^\d+(([ ]*)-([ ]*))\d+([ ]*,[ ]*\d+(([ ]*)-([ ]*))\d+)*$/;

        if (!regex.test(value)) {
            return { rangeFormat: true };
        }


        const parts = value.split(COMMA);
        const firstNumbers = parts.map((part: string) => part.split(HYPHEN)[0]);
        const secondNumbers = parts.map((part: string) => part.split(HYPHEN)[1]);

        const isValid = firstNumbers.every((num: string, index: number) => Utils.isMinNumber(num, secondNumbers[index]));

        if (!isValid) {
            return { rangeOrder: true };
        }

        return null;
    }

    private parseAccountRanges(input: string): AccountRange[] {
        const ranges: AccountRange[] = [];
        const rangeStrings = input.split(COMMA);

        for (const rangeString of rangeStrings) {

            const [startStr, endStr] = rangeString.split(HYPHEN);
            const range: AccountRange = {
                accountRangeMin: startStr,
                accountRangeMax: endStr
            };
            ranges.push(range);
        }
        return ranges;
    }

    private openDeleteConfirmDialog(accountRanges: AccountRange[]): void {
        const isMultiDelete = (accountRanges.length > 1);

        const dialogConfig: DialogConfig<any> = {
            title: `Delete Account Range${(isMultiDelete) ? 's' : EMPTY}`,
            buttons: [
                {
                    label: CONFIRM,
                    color: this.ButtonColor.PRIMARY,
                    click: () => {

                        this.deleteAccountRanges(accountRanges);
                        deleteDialog.close();
                    }
                },
                {
                    label: CLOSE,
                    color: this.ButtonColor.SECONDARY,
                    click: () => {
                        deleteDialog.close();
                    }
                }
            ],
            buttonDirection: ButtonDirection.RIGHT,
            message: `Are you sure want to delete Account Range${(isMultiDelete) ? 's' : EMPTY}${QUESTION_MARK}`
        }

        const deleteDialog = this.dialog.open(
            DialogComponent,
            {
                width: '420px',
                hasBackdrop: true,
                disableClose: true,
                ariaLabel: 'account-range-delete-confirm-dialog',
                data: dialogConfig
            }
        );
    }

    private setEditAccountRangeFormFields(accountRange: AccountRange): void {
        this.editAccountRangeFormFields = [
            {
                key: 'rangeStart',
                label: 'Range Start',
                type: FormFieldType.INPUT_NUMBER,
                value: accountRange.rangeStart!,
                validations: (form: CustomFormGroup<unknown>, field: FormField) => {
                    const validations: ValidatorFn[] = [Validators.required, CustomValidator.noWhiteSpace];

                    if (Utils.isMinNumber(form.get('rangeEnd')?.value, form.get(field.key)?.value)) {
                        validations.push(() => ({ invalidStartRange: true }));
                    }
                    //  else {
                    //     form.get(field.key)?.setErrors(null);
                    // }

                    return validations;

                }
            },
            {
                key: 'rangeEnd',
                label: 'Range End',
                type: FormFieldType.INPUT_NUMBER,
                value: accountRange.rangeEnd!,
                validations: (form: CustomFormGroup<unknown>, field: FormField) => {
                    const validations: ValidatorFn[] = [Validators.required, CustomValidator.noWhiteSpace];

                    if (Utils.isMinNumber(form.get(field.key)?.value, form.get('rangeStart')?.value)) {
                        validations.push(() => ({ invalidEndRange: true }));
                    }
                    //  else {
                    //     form.get(field.key)?.setErrors(null);
                    // }

                    return validations;
                }
            }
        ];
    }

    private openEditAccountRangeDialog(accountRange: AccountRange) {
        this.setEditAccountRangeFormFields(accountRange);

        const dialogConfig: DialogConfig<any> = {
            title: 'Edit Account Range',
            buttons: [
                {
                    label: 'SUBMIT',
                    color: this.ButtonColor.PRIMARY,
                    click: () => {
                        const newRangeData = this.editRangeFormComponent.getDynamicFormValue();

                        const payload: AccountRanges = {
                            accountRanges: [
                                {
                                    accountRangeMin: newRangeData.rangeStart,
                                    accountRangeMax: newRangeData.rangeEnd,
                                    uiId: accountRange.uiId
                                }
                            ]
                        }
                        this.validateAccountRanges(payload, true, editDialog);
                        // editDialog.close();
                    }
                },
                {
                    label: CLOSE,
                    color: this.ButtonColor.SECONDARY,
                    click: () => {
                        editDialog.close();
                    }
                }
            ],
            buttonDirection: ButtonDirection.RIGHT,
            dialogContent: this.editAccountRangeTemplate
        }

        const editDialog = this.dialog.open(
            DialogComponent,
            {
                width: '620px',
                hasBackdrop: true,
                disableClose: true,
                ariaLabel: 'account-range-edit-dialog',
                data: dialogConfig
            }
        );

    }

    private deleteAccountRanges(selectedAccountRanges: AccountRange[]): void {
        this.accountRangeList = this.accountRangeList.filter(
            (dataSourceItem: AccountRange) => !selectedAccountRanges.some(
                (selectedRange: AccountRange) => dataSourceItem.uiId === selectedRange.uiId)
        );

        this.updateInvalidAccountRanges(this.accountRangeList);
    }

    private updateInvalidAccountRanges(accountRangeList: AccountRange[]): void {
        this.showAccountRangeList = !!accountRangeList.length;
        this.invalidAccountRanges = accountRangeList.filter(accountRange => !accountRange.valid).length;
    }

    private setChildFormFields(): void {
        this.basicsFormFields = [
            {
                key: 'enrollmentCollectionName',
                label: 'Enrollment Collection Name',
                value: (this.mode === Mode.Manage) ? this.enrollmentCollection.enrollmentCollectionName! : EMPTY,
                type: FormFieldType.DEFAULT,
                fieldSpan: FieldSpan.TEN,
                validations: [
                    Validators.required,
                    CustomValidator.noWhiteSpace
                ]
            },
            ...((this.mode === Mode.Create) ?
                [
                    {
                        key: 'tenantId',
                        label: 'Tenant',
                        type: FormFieldType.SEARCH_SELECT,
                        fieldSpan: FieldSpan.THREE,
                        validations: [
                            Validators.required
                        ],
                        options: this.enrollmentCollectionService.getEntityOptionList(this.tenantList, TenantType.TENANT),
                        onChange: (valObj: any, form: CustomFormGroup<unknown>, component: DynamicFormComponent) => {
                            if (this.mode === Mode.Create) {
                                const value = valObj?.value;

                                if (Utils.isNotNull(value)) {
                                    form.get('entityId')?.patchValue(value);

                                    form.get('subTenantId')?.reset();

                                    const subTenants = this.tenantList?.filter(ten => (ten.tenantId === value) && (ten.tenantType === TenantType.SUBTENANT)) || [];

                                    let depField = component.formFields.find(f => f.key === 'subTenantId');

                                    if (depField) {
                                        if (depField.options instanceof Array
                                        ) {
                                            depField.options.length = 0;

                                            setTimeout(() => {
                                                depField!.options = subTenants.map(subTen => new Option(subTen.tenantEnrollmentId, subTen.subtenantName!));

                                            }, 500);
                                        }
                                    }
                                }
                            }
                        },
                        disable: () => (this.mode === Mode.Manage),
                    },
                    {
                        key: 'subTenantId',
                        label: 'Sub-Tenant',
                        type: FormFieldType.SEARCH_SELECT,
                        fieldSpan: FieldSpan.THREE,
                        options: [],
                        onChange: (valObj: any, form: CustomFormGroup<unknown>) => {
                            if (this.mode === Mode.Create) {
                                const value = valObj?.value;

                                if (Utils.isNotNull(value)) {
                                    form.get('entityId')?.patchValue(value);
                                }
                            }
                        },
                        disable: () => (this.mode === Mode.Manage),
                    },
                    {
                        key: 'entityId',
                        label: 'Entity Id',
                        type: FormFieldType.DEFAULT,
                        fieldSpan: FieldSpan.FOUR,
                        disable: () => true,
                    }
                ] : [])

        ];



        this.eligibilityFormFields = [
            {
                key: 'enrollmentType',
                label: 'Select Eligibility Type',
                value: EnrollmentType.AccountRange,
                type: FormFieldType.DROPDOWN,
                validations: [
                    Validators.required
                ],
                options: [
                    {
                        label: 'Account Range',
                        value: EnrollmentType.AccountRange
                    }
                ],
                disable: () => this.disabled
            },
            ...(
                this.disabled
                    ? []
                    : [{
                        key: 'accountRanges',
                        label: 'Account Ranges',
                        labelHintTooltip: 'Valid Format: <MIN AR> - <MAX AR>,...<MIN AR> - <MAX AR>',
                        type: FormFieldType.TEXTAREA,
                        validations:
                            () => {
                                return (
                                    !this.accountRangeList?.length
                                        ?
                                        [
                                            Validators.required,
                                            this.accountRangeValidator.bind(this)
                                        ]
                                        :
                                        []
                                );
                            }
                    }])
        ];
    }

    private getTenantType(tenantId: string): string {
        const matchingTenant = this.tenantList.find(tenant => tenant.tenantEnrollmentId === tenantId);

        return matchingTenant ? matchingTenant.tenantType! : EMPTY;
    }


    private getTenants(callback: Function) {
        this.enrollmentCollectionService.getTenantList().subscribe(response => {
            if (Utils.isNotNull(response.data)) {
                this.tenantList = response.data;

                callback && callback();
            }
        });
    }

    private init(): void {
        if (this.mode === Mode.Manage) {
            this.accountRangeList = this.enrollmentCollection.accountRange!;
            this.updateInvalidAccountRanges(this.accountRangeList);

        }
    }

    private validateAccountRanges(payload: AccountRanges, isUpdatingSingleRange: boolean = false, editDialog?: MatDialogRef<DialogComponent, any>): void {
        this.enrollmentCollectionService.verifyAccountRanges(payload).subscribe({
            next: (response: AccountRangesResponse) => {

                if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {

                    if (isUpdatingSingleRange) {
                        this.accountRangeList = this.accountRangeList.map(item => {
                            if (item.uiId === payload.accountRanges[0].uiId) {
                                return response.accountRanges.accountRanges[0];
                            }
                            return item;
                        });
                    } else {
                        this.accountRangeList.push(...response.accountRanges.accountRanges);
                        this.accountRangeList = [...this.accountRangeList];
                    }

                    this.updateInvalidAccountRanges(this.accountRangeList);
                } else {
                    this.alertService.showResponseErrors(response.errors);
                }

                editDialog?.close();
            },
            error: error => {
                console.log(error);
            }
        });
    }

    protected getTenant(id: string): Tenant | null {
        if (!!id && Utils.isNotNull(this.tenantList)) {
            return this.tenantList.find(ten => ten.tenantEnrollmentId === id)!;
        }

        return null;
    }


    ngOnInit(): void {
        this.showAccountRangeList = (this.mode === Mode.Manage) ? true : false;

        this.init();
    }

    ngAfterViewInit(): void {
        this.getTenants(() => this.setChildFormFields());
    }

    getTimeZone(): string {
        return DateUtils.getTimeZone();
    }

    onPlanAssignmentClick(): void { }

    preparePayloadAndValidateAccountRanges(): void {
        const eligibilityFormData = this.eligibilityFormComponent.getDynamicFormValue();

        if (Utils.isNotNull(eligibilityFormData) && Utils.isNotNull(eligibilityFormData.accountRanges)) {
            const payload: AccountRanges = {
                accountRanges: this.parseAccountRanges(this.getParsedAccountRangeValues(eligibilityFormData.accountRanges))
            };

            this.validateAccountRanges(payload);
        } else {
            this.alertService.showError('Please enter account range(s).');
        }
    }

    pathValuesToEnrollmentFormGroup(): boolean {
        let basicsFormInfo = this.basicsFormComponent.getDynamicFormValue();
        let eligibilityFormInfo = this.eligibilityFormComponent.getDynamicFormValue();
        let alertMessage;

        if (Utils.isNotNull(basicsFormInfo) && Utils.isNotNull(eligibilityFormInfo) && this.accountRangeList.length > 0) {
            // basicsFormInfo.startDate = this.functionService.parseDateTimeFilters(basicsFormInfo, 'startDate', 'startTime');
            // basicsFormInfo.endDate = this.functionService.parseDateTimeFilters(basicsFormInfo, 'endDate', 'endTime');

            this.enrollmentCollectionFormGroup.patchValue(basicsFormInfo);
            this.enrollmentCollectionFormGroup.patchValue(eligibilityFormInfo);
            this.enrollmentCollectionFormGroup.controls.entityType.patchValue(this.getTenantType(basicsFormInfo.entityId));
            this.enrollmentCollectionFormGroup.controls.accountRange.patchValue(this.accountRangeList);

            if (this.mode === Mode.Manage) {
                this.enrollmentCollectionFormGroup.controls.entityId.patchValue(this.enrollmentCollection.tenantEnrollmentId);
                this.enrollmentCollectionFormGroup.controls.entityType.patchValue(this.getTenantType(this.enrollmentCollection.tenantEnrollmentId!));
            }

            return true;
        }
        if (Utils.isNotNull(basicsFormInfo) && Utils.isNotNull(eligibilityFormInfo) && this.accountRangeList.length === 0) {
            alertMessage = 'Please add account range(s) before preceding.'
        } else {
            alertMessage = VALIDATION_FAIL_ERROR;
        }
        this.alertService.showError(alertMessage);

        return false;
    }

    ngOnDestroy(): void {

        GarbageCollectorService.clearDetachedDOMElements(
            this,
            this.viewContainerRef
        )
    }
}