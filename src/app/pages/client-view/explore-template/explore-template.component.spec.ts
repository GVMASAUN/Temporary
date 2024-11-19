import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreTemplateComponent } from './explore-template.component';

describe('ExploreTemplateComponent', () => {
  let component: ExploreTemplateComponent;
  let fixture: ComponentFixture<ExploreTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExploreTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
