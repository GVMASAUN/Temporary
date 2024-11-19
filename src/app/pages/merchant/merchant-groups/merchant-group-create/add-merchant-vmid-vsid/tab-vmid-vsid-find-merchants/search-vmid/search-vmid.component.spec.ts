import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchVmidComponent } from './search-vmid.component';

describe('SearchVmidComponent', () => {
  let component: SearchVmidComponent;
  let fixture: ComponentFixture<SearchVmidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchVmidComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchVmidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
