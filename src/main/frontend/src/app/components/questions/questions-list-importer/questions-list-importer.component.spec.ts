import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { QuestionsListImporterComponent } from "./questions-list-importer.component";

describe("QuestionsListImporterComponent", () => {
  let component: QuestionsListImporterComponent;
  let fixture: ComponentFixture<QuestionsListImporterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [QuestionsListImporterComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionsListImporterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
