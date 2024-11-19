import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep } from 'lodash';
import { Observable, map } from 'rxjs';
import { DateTimeFormat, QUESTION_MARK } from 'src/app/core/constants';
import { Module } from 'src/app/core/models/module.model';
import { PaginationResponse, ResponseError } from 'src/app/core/models/pagination-response.model';
import { Currency, EndpointTemplate, EnrollmentCollection, FulfillmentTemplate, MerchantCategoryCode, NotificationTemplate, Plan, Tenant } from 'src/app/pages/pay-with-point/pwp-csr.model';
import { CommentModel } from 'src/app/shared/comments-modal/comments-modal.model';
import { SearchTableService } from 'src/app/shared/search-table/search-table.service';
import { ApiConfigService } from '../api-config.service';
import { AuthorizationService } from '../authorization.service';
import { FormService } from '../form-service/form.service';
import { ToggleAlertService } from '../toggle-alert/toggle-alert.service';
import { DateUtils } from '../util/dateUtils';
import { FunctionsService } from '../util/functions.service';

@Injectable({
  providedIn: 'root'
})
export class PayWithPointService {

  private readonly URL_CONFIG = {
    base: `${this.env.getUrls().baseUrl}api/v1/plan/`,
    utilsBase: `${this.env.getUrls().baseUrl}api/v1/pwp/utils/`,
    CRUDOperations: 'plan',
    advancedSearch: 'listPlans'
  };

  private readonly sortMapping: { [key: string]: string; } = {
    statusCode: 'planStatus'
  };

  private errorMessages = {};

  public communityCode!: string;

  constructor(
    private searchTableService: SearchTableService,
    private formService: FormService,
    private httpClient: HttpClient,
    private activatedRoute: ActivatedRoute,
    private authorizationService: AuthorizationService,
    private alertService: ToggleAlertService,
    private router: Router,
    private functionService: FunctionsService,
    private env: ApiConfigService
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.communityCode = params['client'];
    });
  }

  private parseResponse(response: PaginationResponse<Plan>): PaginationResponse<Plan> {
    const plan: Plan = response?.data;

    if (plan.startDate) {
      plan.startDate = DateUtils.formatDateTime(plan.startDate);

      plan.startTime = DateUtils.formatDateTime(plan.startDate, DateTimeFormat.HH_MM_SS);
    }


    if (plan.endDate) {
      plan.endDate = DateUtils.formatDateTime(plan.endDate);

      plan.endTime = DateUtils.formatDateTime(plan.endDate, DateTimeFormat.HH_MM_SS);
    }

    return response;
  }

  private preparePayload(plan: Plan): Plan {
    const payload: Plan = cloneDeep(plan);

    if (payload) {

      payload.startDate = `${DateUtils.formatDateTime(payload.startDate, DateTimeFormat.MOMENT_YYYY_MM_DD)} ${payload.startTime}`;
      payload.startDate = DateUtils.formatDateTime(payload.startDate, DateTimeFormat.MOMENT_YYYY_MM_DD_T_HH_MM_SS);

      payload.endDate = `${DateUtils.formatDateTime(payload.endDate, DateTimeFormat.MOMENT_YYYY_MM_DD)} ${payload.endTime}`;
      payload.endDate = DateUtils.formatDateTime(payload.endDate, DateTimeFormat.MOMENT_YYYY_MM_DD_T_HH_MM_SS);

      delete payload.startTime;
      delete payload.endTime;

    }

    return payload;
  }

  public advancedSearch(params: any = {}): Observable<PaginationResponse<Plan[]>> {
    const payload: any = {
      ...(!!params?.startDate ? { startDateOperator: '>=' } : {}),
      ...(!!params?.endDate ? { endDateOperator: '<=' } : {}),
      ...params
    };


    return this.httpClient.get<PaginationResponse<Plan[]>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.advancedSearch}${QUESTION_MARK}${this.searchTableService.prepareSearchParams(payload, this.sortMapping, true)}`
    );
  }

  public getCurrencies(): Observable<PaginationResponse<Currency[]>> {
    return this.httpClient.get<PaginationResponse<Currency[]>>(
      `${this.URL_CONFIG.utilsBase}listCurrencies`
    );
  }

  public getTenants(): Observable<PaginationResponse<Tenant[]>> {
    return this.httpClient.get<PaginationResponse<Tenant[]>>(
      `${this.URL_CONFIG.utilsBase}listTenants`
    );
  }

  public getEnrolmentCollections(tenantEnrollmentId: string): Observable<PaginationResponse<EnrollmentCollection[]>> {
    const params: any = {
      tenantId: tenantEnrollmentId
    };

    return this.httpClient.get<PaginationResponse<EnrollmentCollection[]>>(
      `${this.URL_CONFIG.utilsBase}/ec/getActiveEnrollmentCollectionListByTenant`,
      { params }
    );
  }

  public getEndpointTemplates(tenantEnrollmentId: string): Observable<PaginationResponse<EndpointTemplate[]>> {
    const params: any = {
      tenantEnrollmentId: tenantEnrollmentId
    };

    return this.httpClient.get<PaginationResponse<EndpointTemplate[]>>(
      `${this.URL_CONFIG.utilsBase}listEPMDefinitions`,
      { params }
    );
  }

  public getNotificationTemplates(tenantEnrollmentId: string): Observable<PaginationResponse<NotificationTemplate[]>> {
    const params: any = {
      tenantEnrollmentId: tenantEnrollmentId
    };

    return this.httpClient.get<PaginationResponse<NotificationTemplate[]>>(
      `${this.URL_CONFIG.utilsBase}listNotificationTemplates`,
      { params }
    );
  }


  public getFulfillmentTemplates(tenantEnrollmentId: string): Observable<PaginationResponse<FulfillmentTemplate[]>> {
    const params: any = {
      tenantEnrollmentId: tenantEnrollmentId
    };

    return this.httpClient.get<PaginationResponse<FulfillmentTemplate[]>>(
      `${this.URL_CONFIG.utilsBase}listFulfillmentTemplates`,
      { params }
    );
  }

  public getMerchantCategoryCodes(): Observable<PaginationResponse<MerchantCategoryCode[]>> {
    return this.httpClient.get<PaginationResponse<MerchantCategoryCode[]>>(
      `${this.URL_CONFIG.utilsBase}listMccs`
    );
  }

  public getPayWithPoint(planId: string, tenantEnrollmentId: string): Observable<PaginationResponse<Plan>> {
    const params = {
      tenantEnrollmentId: tenantEnrollmentId
    };

    return this.httpClient.get<PaginationResponse<Plan>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${planId}`,
      { params }
    ).pipe(map(response => this.parseResponse(response)));
  }

  public createPayWithPoint(plan: Plan): Observable<PaginationResponse<Plan>> {
    return this.httpClient.post<PaginationResponse<Plan>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}`,
      this.preparePayload(plan));
  }

  public updatePayWithPoint(planId: null | string, plan: Plan): Observable<PaginationResponse<Plan>> {
    return this.httpClient.put<PaginationResponse<Plan>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${planId}`,
      this.preparePayload(plan)
    );
  }

  public submitPlan(planId: string, tenantEnrollmentId: string): Observable<PaginationResponse<Plan>> {
    const params: any = {
      tenantEnrollmentId: tenantEnrollmentId
    };

    return this.httpClient.put<PaginationResponse<Plan>>(
      `${this.URL_CONFIG.base}statusToPending/${planId}${QUESTION_MARK}${this.functionService.prepareParams(params)}`,
      {}
    );
  }

  public approvePlan(planId: string, tenantEnrollmentId: string): Observable<PaginationResponse<Plan>> {
    const params: any = {
      tenantEnrollmentId: tenantEnrollmentId
    };

    return this.httpClient.put<PaginationResponse<Plan>>(
      `${this.URL_CONFIG.base}statusToApproved/${planId}${QUESTION_MARK}${this.functionService.prepareParams(params)}`,
      undefined
    );

  }

  public rejectPlan(planId: string, tenantEnrollmentId: string, comment: string): Observable<PaginationResponse<Plan>> {
    const params: any = {
      tenantEnrollmentId: tenantEnrollmentId,
      comment: comment
    };

    return this.httpClient.put<PaginationResponse<Plan>>(
      `${this.URL_CONFIG.base}statusToReject/${planId}${QUESTION_MARK}${this.functionService.prepareParams(params)}`,
      {}
    );

  }

  public archivePlan(planId: string, tenantEnrollmentId: string): Observable<PaginationResponse<Plan>> {
    const params: any = {
      tenantEnrollmentId: tenantEnrollmentId
    };

    return this.httpClient.put<PaginationResponse<Plan>>(
      `${this.URL_CONFIG.base}statusToArchive/${planId}${QUESTION_MARK}${this.functionService.prepareParams(params)}`,
      {}
    );
  }


  public deactivatePlan(planId: string, tenantEnrollmentId: string, version: number): Observable<PaginationResponse<Plan>> {
    const params: any = {
      tenantEnrollmentId: tenantEnrollmentId
    };

    return this.httpClient.put<PaginationResponse<Plan>>(
      `${this.URL_CONFIG.base}statusToInActive/${planId}/version/${version}${QUESTION_MARK}${this.functionService.prepareParams(params)}`,
      {}
    );
  }


  public deletePayWithPoint(planId: string, tenantEnrollmentId: string): Observable<PaginationResponse<null>> {
    const params: any = {
      tenantEnrollmentId: tenantEnrollmentId
    };

    return this.httpClient.delete<PaginationResponse<null>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${planId}${QUESTION_MARK}${this.functionService.prepareParams(params)}`
    );
  }

  public getPayWithPointMessages(planId: number, params: any) {
    return this.httpClient.get<PaginationResponse<Array<CommentModel>>>(
      `${this.env.getUrls().baseUrl}api/v1/message/listPayWithPointMessages/${planId}`, {
      params
    }
    );
  }

  public postPayWithPointMessage(params: any) {
    return this.httpClient.post<PaginationResponse<CommentModel>>(
      `${this.env.getUrls().baseUrl}api/v1/message/planMessage`, params
    );
  }

  public getPlanVersionList(planId: string, tenantEnrollmentId: string): Observable<PaginationResponse<Plan[]>> {
    const params: any = {
      tenantEnrollmentId: tenantEnrollmentId
    };

    return this.httpClient.get<PaginationResponse<Plan[]>>(
      `${this.URL_CONFIG.base}versions/${planId}${QUESTION_MARK}${this.functionService.prepareParams(params)}`,
      {}
    );
  }

  public getPlanByVersion(version: number, planId: string, tenantEnrollmentId: string): Observable<PaginationResponse<Plan>> {
    const params: any = {
      tenantEnrollmentId: tenantEnrollmentId
    };

    return this.httpClient.get<PaginationResponse<Plan>>(
      `${this.URL_CONFIG.base}${planId}/version/${version}${QUESTION_MARK}${this.functionService.prepareParams(params)}`,
      {}
    ).pipe(map(response => this.parseResponse(response)));
  }

  public updateErrorMessages(responseErrors: ResponseError[], form: UntypedFormGroup) {
    this.alertService.showResponseErrors(responseErrors);

    const additionalErrors = this.formService.prepareErrorObject(responseErrors);

    this.errorMessages = { ...this.errorMessages, ...additionalErrors };

    this.formService.setResponseErrors(responseErrors, form);
  }

  public getErrorMessage(form: UntypedFormGroup, fromControl: AbstractControl): string {
    return this.formService.getFormControlErrorMessage(
      form,
      fromControl,
      this.errorMessages
    );
  }


  public navigateToListPage() {
    this.router.navigate(
      [Module.PAY_WITH_POINT.baseUrl],
      {
        queryParamsHandling: 'merge'
      }
    );
  }

  public navigateToManagePage(plan: Plan) {
    this.router.navigate(
      [
        Module.PAY_WITH_POINT.baseUrl,
        'manage',
        plan.planId,
        plan.tenantEnrollmentId,
        plan.version
      ],
      {
        queryParamsHandling: 'merge'
      }
    );
  }


}
