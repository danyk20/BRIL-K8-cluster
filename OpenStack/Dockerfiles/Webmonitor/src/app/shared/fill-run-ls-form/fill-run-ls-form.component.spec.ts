import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FillRunLsQueryFormComponent } from './fill-run-ls-query-form.component';

describe('FillRunLsQueryFormComponent', () => {
  let component: FillRunLsQueryFormComponent;
  let fixture: ComponentFixture<FillRunLsQueryFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FillRunLsQueryFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FillRunLsQueryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
