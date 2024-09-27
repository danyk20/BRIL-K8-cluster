import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FillRunLsQueryWidgetComponent } from './fill-run-ls-query-widget.component';

describe('FillRunLsQueryWidgetComponent', () => {
  let component: FillRunLsQueryWidgetComponent;
  let fixture: ComponentFixture<FillRunLsQueryWidgetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FillRunLsQueryWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FillRunLsQueryWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
