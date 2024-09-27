import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EventBusTesterComponent } from './event-bus-tester.component';

describe('EventBusTesterComponent', () => {
  let component: EventBusTesterComponent;
  let fixture: ComponentFixture<EventBusTesterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EventBusTesterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventBusTesterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
