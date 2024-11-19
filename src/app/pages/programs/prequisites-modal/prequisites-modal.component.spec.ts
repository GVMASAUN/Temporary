import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrequisitesModalComponent } from './prequisites-modal.component';

describe('PrequisitesModalComponent', () => {
  let component: PrequisitesModalComponent;
  let fixture: ComponentFixture<PrequisitesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrequisitesModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrequisitesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
