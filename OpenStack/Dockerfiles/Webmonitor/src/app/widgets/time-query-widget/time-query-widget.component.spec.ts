import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TimeQueryComponent } from './time-query.component';

describe('TimeQueryComponent', () => {
  let component: TimeQueryComponent;
  let fixture: ComponentFixture<TimeQueryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeQueryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
