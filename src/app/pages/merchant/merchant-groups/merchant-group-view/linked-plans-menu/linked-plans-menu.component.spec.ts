import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedPlansMenuComponent } from './linked-plans-menu.component';

describe('LinkedPlansMenuComponent', () => {
  let component: LinkedPlansMenuComponent;
  let fixture: ComponentFixture<LinkedPlansMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LinkedPlansMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkedPlansMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
