import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramElementComponent } from './program-element.component';

describe('ProgramElementComponent', () => {
  let component: ProgramElementComponent;
  let fixture: ComponentFixture<ProgramElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgramElementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
