import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonColor, TabsOrientation } from '@visa/vds-angular';
import { Subject, Subscription } from 'rxjs';
import { Mode } from 'src/app/core/models/mode.model';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { UncategorizedOfferService } from 'src/app/services/uncategorized-offer/uncategorized-offer.service';
import { UncategorizedOffer, UncategorizedOfferStep } from '../../uncategorized-offers.model';
import { takeUntil } from 'rxjs/operators';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { FunctionsService } from 'src/app/services/util/functions.service';

@Component({
  selector: 'app-uncategorized-offer-manage',
  templateUrl: './uncategorized-offer-manage.component.html',
  styleUrls: ['./uncategorized-offer-manage.component.scss']
})
export class UncategorizedOfferManageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  TabsOrientation = TabsOrientation;
  ButtonColor = ButtonColor;
  UncategorizedOfferStep = UncategorizedOfferStep;

  mode: Mode = Mode.Manage;

  selectedTabIndex: number = 0;

  initialized: boolean = false;

  tabs: string[] = [
    UncategorizedOfferStep[UncategorizedOfferStep.Summary]
  ];

  form: UntypedFormGroup = this.formBuilder.group(new UncategorizedOffer());

  readonly viewName = "uncategorized-offer-manage";

  getTabId: Function = this.functionService.getTabId;
  getTabLabelledById: Function = this.functionService.getTabLabelledById;

  get offer(): UncategorizedOffer {
    return this.form.getRawValue() as UncategorizedOffer;
  }

  constructor(
    private formBuilder: UntypedFormBuilder,
    private uncategorizedOfferService: UncategorizedOfferService,
    private route: ActivatedRoute,
    private navStatusService: NavStatusService,
    private viewContainerRef: ViewContainerRef,
    private functionService: FunctionsService
  ) { }

  private mapOffer(response: PaginationResponse<UncategorizedOffer>) {
    this.initialized = false;

    this.form.patchValue(response.data);

    this.form.markAsPristine();

    setTimeout(() => this.initialized = true, 0);
  }

  private init() {
    this.navStatusService.setOverlayStatus(true);

    this.route.paramMap
      .pipe(takeUntil(this.destroy$)).subscribe(params => {
        const stageId = params.get('id');

        if (stageId) {
          const id = parseInt(stageId, 10);

          this.uncategorizedOfferService
            .getUncategorizedOffer(id)
            .subscribe(response => this.mapOffer(response));
        }
      });
  }


  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.navStatusService.setOverlayStatus(false);

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    )
  }
}
