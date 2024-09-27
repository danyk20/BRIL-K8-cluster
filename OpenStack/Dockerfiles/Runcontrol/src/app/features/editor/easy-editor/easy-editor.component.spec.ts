import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EasyEditorComponent } from './easy-editor.component';

describe('EasyEditorComponent', () => {
  let component: EasyEditorComponent;
  let fixture: ComponentFixture<EasyEditorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EasyEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EasyEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
