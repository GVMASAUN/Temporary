import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VmidDataTableComponent } from './vmid-data-table.component';

describe('VmidDataTableComponent', () => {
  let component: VmidDataTableComponent;
  let fixture: ComponentFixture<VmidDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VmidDataTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VmidDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
