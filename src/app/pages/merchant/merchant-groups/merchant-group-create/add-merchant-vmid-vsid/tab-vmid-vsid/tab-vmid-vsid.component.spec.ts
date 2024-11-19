import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabVmidVsidComponent } from './tab-vmid-vsid.component';

describe('TabVmidVsidComponent', () => {
  let component: TabVmidVsidComponent;
  let fixture: ComponentFixture<TabVmidVsidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabVmidVsidComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabVmidVsidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
