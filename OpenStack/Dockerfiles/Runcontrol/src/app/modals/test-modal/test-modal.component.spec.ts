import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TestModalComponent } from './test-modal.component';

describe('TestModalComponent', () => {
  let component: TestModalComponent;
  let fixture: ComponentFixture<TestModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TestModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
