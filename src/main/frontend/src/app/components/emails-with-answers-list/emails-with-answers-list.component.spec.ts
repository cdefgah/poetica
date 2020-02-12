import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailsWithAnswersListComponent } from './emails-with-answers-list.component';

describe('EmailsWithAnswersListComponent', () => {
  let component: EmailsWithAnswersListComponent;
  let fixture: ComponentFixture<EmailsWithAnswersListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailsWithAnswersListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailsWithAnswersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
