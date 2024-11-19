import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateDateModalComponent } from './update-date-modal.component';

describe('UpdateDateModalComponent', () => {
  let component: UpdateDateModalComponent;
  let fixture: ComponentFixture<UpdateDateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateDateModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateDateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
