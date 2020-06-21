import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AnswersListImporterComponent } from "./answers-list-importer.component";

describe("AnswersListImporterComponent", () => {
  let component: AnswersListImporterComponent;
  let fixture: ComponentFixture<AnswersListImporterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AnswersListImporterComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswersListImporterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
