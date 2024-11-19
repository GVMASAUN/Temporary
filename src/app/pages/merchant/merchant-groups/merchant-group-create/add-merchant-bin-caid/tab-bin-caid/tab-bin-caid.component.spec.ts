import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabBinCaidComponent } from './tab-bin-caid.component';

describe('TabBinCaidComponent', () => {
  let component: TabBinCaidComponent;
  let fixture: ComponentFixture<TabBinCaidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabBinCaidComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabBinCaidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
