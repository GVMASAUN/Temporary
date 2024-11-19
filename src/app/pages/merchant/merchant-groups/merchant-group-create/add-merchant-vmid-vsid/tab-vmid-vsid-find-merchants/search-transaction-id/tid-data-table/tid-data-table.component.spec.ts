import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TidDataTableComponent } from './tid-data-table.component';

describe('TidDataTableComponent', () => {
  let component: TidDataTableComponent;
  let fixture: ComponentFixture<TidDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TidDataTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TidDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
