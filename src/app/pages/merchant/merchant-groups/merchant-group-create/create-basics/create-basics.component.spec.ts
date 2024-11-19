import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBasicsComponent } from './create-basics.component';

describe('CreateBasicsComponent', () => {
  let component: CreateBasicsComponent;
  let fixture: ComponentFixture<CreateBasicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateBasicsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateBasicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
