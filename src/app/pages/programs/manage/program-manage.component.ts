import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonColor, TabsOrientation } from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Mode } from 'src/app/core/models/mode.model';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { UserRole } from 'src/app/core/models/user.model';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { ProgramService } from 'src/app/services/program/program.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';
import { Program, ProgramStep } from '../program.model';

@Component({
  selector: 'app-program-manage',
  templateUrl: './program-manage.component.html',
  styleUrls: ['./program-manage.component.scss']
})
export class ProgramManageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  readonly viewName = "program-manage";

  TabsOrientation = TabsOrientation;
  ButtonColor = ButtonColor;
  ProgramStep = ProgramStep;

  form: UntypedFormGroup = this.formBuilder.group(new Program());


  tabs: string[] = [
    ProgramStep.SUMMARY,
    ...(
      this.editable
        ?
        [
          ProgramStep.BASICS,
          ProgramStep.EVENT_GROUPS,
          ProgramStep.VISUAL_BUILDER
        ]
        :
        []
    )
  ];


  initialized: boolean = false;

  selectedTabIndex: number = 0;
  id!: number;

  mode: Mode = Mode.Manage;


  getTabId: Function = this.functionService.getTabId;
  getTabLabelledById: Function = this.functionService.getTabLabelledById;


  get editable(): boolean {
    return this.authorizationService?.getUserRole() !== UserRole.CLIENT_READ_ONLY;
  }

  constructor(
    private formBuilder: UntypedFormBuilder,
    private programService: ProgramService,
    private route: ActivatedRoute,
    private navStatusService: NavStatusService,
    private viewContainerRef: ViewContainerRef,
    private functionService: FunctionsService,
    private authorizationService: AuthorizationService
  ) { }

  public setCurrentTab(index: number = this.tabs.indexOf(!this.editable ? ProgramStep.SUMMARY : ProgramStep.BASICS)) {
    this.selectedTabIndex = index;
  }

  public init(callback: Function = () => { }) {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const stageId = params.get('id');

        if (stageId) {
          this.id = parseInt(stageId, 10);

          this.programService.getProgram(this.id)
            .subscribe(response => {
              this.mapProgram(response);

              callback();
            }
            );
        }
      });
  }

  ngOnInit(): void {
    if (this.editable) {
      this.registerOnChangeListeners();
    }

    this.setCurrentTab();
    this.init();

    this.navStatusService.setOverlayStatus(true);
  }

  private registerOnChangeListeners() {
  }

  private mapProgram(response: PaginationResponse<Program>) {
    this.initialized = false;

    const programData: Program = response.data;

    if (Utils.isNotNull(programData)) {
      this.form.patchValue(programData);
      this.form.markAsPristine();

      setTimeout(() => this.initialized = true, 0);
    }
  }

  onTabChange(event: any) {
    this.navStatusService.togglePanel(false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.navStatusService.setOverlayStatus(false);


    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef,
      true
    );
  }
}
