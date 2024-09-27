import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DateRangeFormComponent } from './date-range-form.component';

describe('DateRangeFormComponent', () => {
  let component: DateRangeFormComponent;
  let fixture: ComponentFixture<DateRangeFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DateRangeFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateRangeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
