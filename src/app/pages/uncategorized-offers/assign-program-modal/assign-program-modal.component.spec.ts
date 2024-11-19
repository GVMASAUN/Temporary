import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignProgramModalComponent } from './assign-program-modal.component';

describe('AssignProgramModalComponent', () => {
  let component: AssignProgramModalComponent;
  let fixture: ComponentFixture<AssignProgramModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignProgramModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignProgramModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
