import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportEventModalComponent } from './import-event-modal.component';

describe('ImportEventModalComponent', () => {
  let component: ImportEventModalComponent;
  let fixture: ComponentFixture<ImportEventModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportEventModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportEventModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
