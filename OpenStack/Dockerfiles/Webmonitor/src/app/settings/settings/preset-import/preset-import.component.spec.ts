import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PresetImportComponent } from './preset-import.component';

describe('PresetImportComponent', () => {
  let component: PresetImportComponent;
  let fixture: ComponentFixture<PresetImportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PresetImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresetImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
