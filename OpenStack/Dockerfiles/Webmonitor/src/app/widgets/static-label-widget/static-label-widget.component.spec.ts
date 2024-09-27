import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StaticLabelWidgetComponent } from './static-label-widget.component';

describe('StaticLabelWidgetComponent', () => {
  let component: StaticLabelWidgetComponent;
  let fixture: ComponentFixture<StaticLabelWidgetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StaticLabelWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticLabelWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
