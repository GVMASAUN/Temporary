import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchTransactionDetailsComponent } from './search-transaction-details.component';

describe('SearchTransactionDetailsComponent', () => {
  let component: SearchTransactionDetailsComponent;
  let fixture: ComponentFixture<SearchTransactionDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchTransactionDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchTransactionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
