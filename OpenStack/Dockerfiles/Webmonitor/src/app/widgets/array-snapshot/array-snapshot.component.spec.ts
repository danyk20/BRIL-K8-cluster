import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ArraySnapshotComponent } from './array-snapshot.component';

describe('ArraySnapshotComponent', () => {
  let component: ArraySnapshotComponent;
  let fixture: ComponentFixture<ArraySnapshotComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ArraySnapshotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArraySnapshotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
