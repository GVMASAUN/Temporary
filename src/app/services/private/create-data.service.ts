import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class CreateDataService {
  constructor() {}

  createMerchantData = new BehaviorSubject<{
    name?: string;
    merchantGroupName?: string;
    type?: string;
    description?: string;
    optionalComment?: string;
    communityCode?: string;
    createdBy?: string;
    createdDate?: string;
    id?: string;
    isActive?: string;
    merchantDetails?: any;
    acquirerDetails?: any;
    merchantGroupType?: string;
    modifiedBy?: string;
    modifiedDate?: string;
  } | null>(null);
}
