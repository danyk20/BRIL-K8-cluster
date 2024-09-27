import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OldVersionIndicatorComponent } from './old-version-indicator.component';

describe('OldVersionIndicatorComponent', () => {
  let component: OldVersionIndicatorComponent;
  let fixture: ComponentFixture<OldVersionIndicatorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OldVersionIndicatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OldVersionIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
