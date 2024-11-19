import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowColumnsComponent } from './show-columns.component';

describe('ShowColumnsComponent', () => {
  let component: ShowColumnsComponent;
  let fixture: ComponentFixture<ShowColumnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowColumnsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowColumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
