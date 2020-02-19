import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PickListDialogComponent } from './pick-list-dialog.component';

describe('PickListDialogComponent', () => {
  let component: PickListDialogComponent;
  let fixture: ComponentFixture<PickListDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PickListDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PickListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
