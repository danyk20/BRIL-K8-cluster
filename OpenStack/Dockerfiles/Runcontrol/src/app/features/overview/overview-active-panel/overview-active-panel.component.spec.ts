import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OverviewActivePanelComponent } from './overview-active-panel.component';

describe('OverviewActivePanelComponent', () => {
  let component: OverviewActivePanelComponent;
  let fixture: ComponentFixture<OverviewActivePanelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OverviewActivePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewActivePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
