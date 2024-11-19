import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PwpPanEligibilityComponent } from './pwp-pan-eligibility.component';

describe('PwpPanEligibilityComponent', () => {
  let component: PwpPanEligibilityComponent;
  let fixture: ComponentFixture<PwpPanEligibilityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PwpPanEligibilityComponent]
    });
    fixture = TestBed.createComponent(PwpPanEligibilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
