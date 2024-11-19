import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchVsidComponent } from './search-vsid.component';

describe('SearchVsidComponent', () => {
  let component: SearchVsidComponent;
  let fixture: ComponentFixture<SearchVsidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchVsidComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchVsidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
