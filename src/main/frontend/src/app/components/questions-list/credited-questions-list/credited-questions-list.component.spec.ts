import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditedQuestionsListComponent } from './credited-questions-list.component';

describe('CreditedQuestionsListComponent', () => {
  let component: CreditedQuestionsListComponent;
  let fixture: ComponentFixture<CreditedQuestionsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditedQuestionsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditedQuestionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
