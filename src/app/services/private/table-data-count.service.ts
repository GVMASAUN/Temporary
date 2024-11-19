import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class TableDataCountService {
  // private merchantStatus = new BehaviorSubject<string>('');

  private Clients = new BehaviorSubject<object[]>([]);
  private Merchant = new BehaviorSubject<any>(null);
  private LinkedPlans = new BehaviorSubject<object[]>([]);
  private History = new BehaviorSubject<object[]>([]);
  private merchantCount = new BehaviorSubject<number>(0);

  refreshRequest = new BehaviorSubject<
    'merchant' | ''
  >('');

  private selectedMerchant = new BehaviorSubject<object | null>(
    JSON.parse(localStorage.getItem('selectedMerchant') || '{}')
  );

  constructor() { }

  // setMerchantStatus(data: string) {
  //   this.merchantStatus.next(data);
  // }
  // getMerchantStatus() {
  //   return this.merchantStatus.asObservable();
  // }

  setClientsData(data: object[]) {
    this.Clients.next(data);
  }
  getClientsData() {
    return this.Clients.asObservable();
  }

  setMerchantData(data: object[]) {
    this.Merchant.next(data);
  }
  getMerchantData() {
    return this.Merchant.asObservable();
  }

  setLinkedPlansData(data: object[]) {
    this.LinkedPlans.next(data);
  }
  getLinkedPlansData() {
    return this.LinkedPlans.asObservable();
  }

  setHistoryData(data: object[]) {
    this.History.next(data);
  }
  getHistoryData() {
    return this.History.asObservable();
  }

  getSelectedMerchant() {
    return this.selectedMerchant.asObservable();
  }
  setSelectedMerchant(value: merchant | null) {
    this.selectedMerchant.next(value);
    localStorage.setItem('selectedMerchant', JSON.stringify(value));
  }

  setMerchantCount(count: number): void {
    this.merchantCount.next(count);
  }

  getMerchantCount(): Observable<number> {
    return this.merchantCount.asObservable();
  }
}

export interface merchant {
  communityCode: string | null;
  createdBy: string | null;
  createdDate: string | null;
  id: string | null;
  isActive: boolean | null;
  merchantGroupType: string | null;
  modifiedBy: string | null;
  modifiedDate: string | null;
  name: string | null;
}
