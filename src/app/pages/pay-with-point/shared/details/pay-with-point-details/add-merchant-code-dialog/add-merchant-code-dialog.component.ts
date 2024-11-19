import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonColor, ButtonIconType, ListboxContainerComponent, SearchVariant } from '@visa/vds-angular';
import { cloneDeep } from 'lodash';
import { EMPTY, VisaIcon } from 'src/app/core/constants';
import { DialogButton } from 'src/app/core/dialog/dialog.model';
import { MerchantCategoryCode, RedemptionRestriction } from 'src/app/pages/pay-with-point/pwp-csr.model';
import { CustomFormGroup, FormBuilder } from 'src/app/services/form-service/form.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-add-merchant-code-dialog',
  templateUrl: './add-merchant-code-dialog.component.html',
  styleUrls: ['./add-merchant-code-dialog.component.scss']
})
export class AddMerchantCodeDialogComponent implements OnInit, OnDestroy {
  @ViewChild(ListboxContainerComponent)
  listboxContainerComponent!: ListboxContainerComponent;

  @ViewChild('searchInput')
  input!: any;

  private selectedMccsCodes!: string[];

  protected readonly buttonIconType = ButtonIconType;
  protected readonly searchVariant = SearchVariant;
  protected readonly visaIcon = VisaIcon;

  protected readonly form: CustomFormGroup<RedemptionRestriction> = this.formBuilder.group(new RedemptionRestriction());

  protected searchInput: string = EMPTY;
  protected initMccsListBox: boolean = true;

  protected merchantCategoryCodes: MerchantCategoryCode[] = [];
  protected filteredMerchantCategoryCodes: MerchantCategoryCode[] = [];

  protected dialogButtons: DialogButton[] = [
    {
      label: 'Add',
      color: ButtonColor.PRIMARY,
      click: () => this.dialogRef.close(this.form.value),
      disable: () => !this.form.value?.values?.length
    },
    {
      label: 'Select All',
      color: ButtonColor.SECONDARY,
      click: () => {
        this.form.reset();
        this.listboxContainerComponent.listbox.items.forEach(item => item.selectItem());
      },
      disable: () => (this.form.value?.values?.length === this.filteredMerchantCategoryCodes?.length) || Utils.isNull(this.filteredMerchantCategoryCodes)
    },
    {
      label: 'Clear Selection',
      color: ButtonColor.SECONDARY,
      click: () => this.form.reset(),
      disable: () => !this.form.value?.values?.length
    },
    {
      label: 'Close',
      color: ButtonColor.TERTIARY,
      click: () => this.dialogRef.close()
    }
  ];



  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<AddMerchantCodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any
  ) { }

  private setMerchantCategoryCodes() {
    this.selectedMccsCodes = this.dialogConfig?.selectedMccsCodes;

    this.merchantCategoryCodes = (this.dialogConfig?.mccList || [])
      .filter((mcc: MerchantCategoryCode) => !this.selectedMccsCodes.includes(mcc.mrchCatgCd.toString()));

    this.filteredMerchantCategoryCodes = cloneDeep(this.merchantCategoryCodes);
  }


  protected performSearch(inputDirective: any) {
    if (Utils.isNotNull(this.merchantCategoryCodes)) {
      this.initMccsListBox = false;

      const inputValue: string = inputDirective?.value;


      if (Utils.isNotNull(inputValue)) {
        this.form.reset();

        this.filteredMerchantCategoryCodes = this.merchantCategoryCodes
          .filter((mcc) =>
            mcc.mrchCatgNm.trim()
              .toLowerCase()
              .includes(inputValue.toLowerCase())
          );
      } else {
        this.filteredMerchantCategoryCodes = this.merchantCategoryCodes;
      }


      setTimeout(
        () => this.initMccsListBox = true,
        5
      );
    }
  }

  clearSearchInput() {
    this.form.reset();

    this.input.nativeElement.value = EMPTY;

    this.performSearch({});
  }


  ngOnInit(): void {
    this.setMerchantCategoryCodes();
  }

  ngOnDestroy(): void { }
}
