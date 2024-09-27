import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NumericFieldComponent } from './numeric-field.component';

describe('NumericFieldComponent', () => {
  let component: NumericFieldComponent;
  let fixture: ComponentFixture<NumericFieldComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NumericFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumericFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
