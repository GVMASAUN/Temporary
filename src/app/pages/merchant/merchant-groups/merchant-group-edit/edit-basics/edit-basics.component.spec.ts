import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBasicsComponent } from './edit-basics.component';

describe('EditBasicsComponent', () => {
  let component: EditBasicsComponent;
  let fixture: ComponentFixture<EditBasicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditBasicsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBasicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
