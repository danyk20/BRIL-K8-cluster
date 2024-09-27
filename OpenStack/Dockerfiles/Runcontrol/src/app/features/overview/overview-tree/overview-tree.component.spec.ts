import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OverviewTreeComponent } from './overview-tree.component';

describe('OverviewTreeComponent', () => {
  let component: OverviewTreeComponent;
  let fixture: ComponentFixture<OverviewTreeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OverviewTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
