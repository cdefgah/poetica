import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OneEmailWithAnswersComponent } from './one-email-with-answers.component';

describe('OneEmailWithAnswersComponent', () => {
  let component: OneEmailWithAnswersComponent;
  let fixture: ComponentFixture<OneEmailWithAnswersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OneEmailWithAnswersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OneEmailWithAnswersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
