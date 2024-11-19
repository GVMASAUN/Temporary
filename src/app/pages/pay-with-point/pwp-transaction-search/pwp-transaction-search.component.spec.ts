import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PwpTransactionSearchComponent } from './pwp-transaction-search.component';

describe('PwpTransactionSearchComponent', () => {
  let component: PwpTransactionSearchComponent;
  let fixture: ComponentFixture<PwpTransactionSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PwpTransactionSearchComponent]
    });
    fixture = TestBed.createComponent(PwpTransactionSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
