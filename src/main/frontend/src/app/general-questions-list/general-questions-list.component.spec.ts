import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralQuestionsListComponent } from './general-questions-list.component';

describe('GeneralQuestionsListComponent', () => {
  let component: GeneralQuestionsListComponent;
  let fixture: ComponentFixture<GeneralQuestionsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralQuestionsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralQuestionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
