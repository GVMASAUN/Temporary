import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VsidDataTableComponent } from './vsid-data-table.component';

describe('VsidDataTableComponent', () => {
  let component: VsidDataTableComponent;
  let fixture: ComponentFixture<VsidDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VsidDataTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VsidDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
