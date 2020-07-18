import { Component, OnInit, Inject } from "@angular/core";
import {
  MatDialogConfig,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";

import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { QuestionDataModel } from "src/app/data-model/QuestionDataModel";
import { QuestionsImporter } from "./utils/QuestionsImporter";
import { AbstractInteractiveComponentModel } from "../../core/base/AbstractInteractiveComponentModel";
import { QuestionValidationService } from "../../core/validators/QuestionValidationService";

@Component({
  selector: "app-questions-list-importer",
  templateUrl: "./questions-list-importer.component.html",
  styleUrls: ["./questions-list-importer.component.css"],
})
export class QuestionsListImporterComponent
  extends AbstractInteractiveComponentModel
  implements OnInit {
  rawSourceTextFormGroup: any;

  dataSource: QuestionDataModel[] = [];

  displayedColumns: string[] = [
    "externalNumber",
    "graded",
    "title",
    "body",
    "source",
    "comment",
  ];

  sourceText: string;

  foundError: string = "";

  dataIsReadyForImport: boolean = false;

  private static readonly KEY_DIALOG_QUESTION_VALIDATOR_SERVICE =
    "questionModelValidatorService";

  questionValidationService: QuestionValidationService;

  static getDialogConfigWithData(
    questionValidationService: QuestionValidationService
  ): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "62%";

    dialogConfig.data = new Map<string, any>();

    dialogConfig.data[
      QuestionsListImporterComponent.KEY_DIALOG_QUESTION_VALIDATOR_SERVICE
    ] = questionValidationService;

    return dialogConfig;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private http: HttpClient,
    public dialog: MatDialogRef<QuestionsListImporterComponent>,
    public otherDialog: MatDialog
  ) {
    super();

    if (!dialogData) {
      return;
    }

    this.questionValidationService =
      dialogData[
        QuestionsListImporterComponent.KEY_DIALOG_QUESTION_VALIDATOR_SERVICE
      ];
  }

  protected getMessageDialogReference(): MatDialog {
    return this.otherDialog;
  }

  ngOnInit() {}

  cancelDialog() {
    this.confirmationDialog("Прервать импорт заданий?", () => {
      // если диалог был принят (accepted)
      this.dialog.close(false);
    });
  }

  onStepChange(event: any) {
    if (event.previouslySelectedIndex == 0) {
      this.foundError = "";
      this.processSourceText();

      this.dataIsReadyForImport = this.foundError.length == 0;
    } else if (event.previouslySelectedIndex == 1) {
      // если вернулись назад
      this.dataIsReadyForImport = false;
    }
  }

  private processSourceText(): void {
    var questionsImporter = new QuestionsImporter(
      this,
      this.sourceText,
      this.questionValidationService,
      this.onQuestionsImportSuccess,
      this.onQuestionImportFailure
    );
    questionsImporter.doImport();
  }

  private onQuestionsImportSuccess(
    importerComponent: QuestionsListImporterComponent,
    questionsList: QuestionDataModel[]
  ) {
    importerComponent.dataSource = questionsList;

    console.log(
      "=================== QUESTIONS TO IMPORT ======================"
    );

    questionsList.forEach((oneQuestion) => {
      console.log("+++++++++++");
      console.log(oneQuestion);
      console.log("+++++++++++");
    });

    console.log(
      "=============================================================="
    );
  }

  private onQuestionImportFailure(
    importerComponent: QuestionsListImporterComponent,
    errorMessage: string
  ) {
    importerComponent.foundError = errorMessage;
  }

  onRowClicked(row: any) {}

  doImportQuestions() {
    this.confirmationDialog("Импортировать задания?", () => {
      // если диалог был принят (accepted)
      // импортируем задания
      const headers = new HttpHeaders().set(
        "Content-Type",
        "application/json; charset=utf-8"
      );

      this.http
        .post("/questions/import", this.dataSource, { headers: headers })
        .subscribe(
          (data) => {
            this.dialog.close(true);
          },
          (error) => this.reportServerError(error, "Сбой при импорте заданий.")
        );
    });
  }
}
