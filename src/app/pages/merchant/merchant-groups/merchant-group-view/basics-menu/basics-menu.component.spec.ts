import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicsMenuComponent } from './basics-menu.component';

describe('BasicsMenuComponent', () => {
  let component: BasicsMenuComponent;
  let fixture: ComponentFixture<BasicsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasicsMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
