import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TdDataTableComponent } from './td-data-table.component';

describe('TdDataTableComponent', () => {
  let component: TdDataTableComponent;
  let fixture: ComponentFixture<TdDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TdDataTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
