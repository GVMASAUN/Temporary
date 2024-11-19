import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchTransactionIdComponent } from './search-transaction-id.component';

describe('SearchTransactionIdComponent', () => {
  let component: SearchTransactionIdComponent;
  let fixture: ComponentFixture<SearchTransactionIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchTransactionIdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchTransactionIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
