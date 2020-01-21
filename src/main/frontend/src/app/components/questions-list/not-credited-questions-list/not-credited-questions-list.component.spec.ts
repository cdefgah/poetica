import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotCreditedQuestionsListComponent } from './not-credited-questions-list.component';

describe('NotCreditedQuestionsListComponent', () => {
  let component: NotCreditedQuestionsListComponent;
  let fixture: ComponentFixture<NotCreditedQuestionsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotCreditedQuestionsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotCreditedQuestionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
