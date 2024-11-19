import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollmentCollectionComponent } from './enrollment-collection.component';

describe('EnrollmentCollectionComponent', () => {
  let component: EnrollmentCollectionComponent;
  let fixture: ComponentFixture<EnrollmentCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnrollmentCollectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollmentCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
