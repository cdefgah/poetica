import { Component, OnInit, Inject } from "@angular/core";
import {
  MatDialogConfig,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";

import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Question } from "src/app/model/Question";
import { QuestionsImporter } from "./utils/QuestionsImporter";
import { AbstractInteractiveComponentModel } from "../../core/base/AbstractInteractiveComponentModel";

@Component({
  selector: "app-questions-list-importer",
  templateUrl: "./questions-list-importer.component.html",
  styleUrls: ["./questions-list-importer.component.css"],
})
export class QuestionsListImporterComponent
  extends AbstractInteractiveComponentModel
  implements OnInit {
  rawSourceTextFormGroup: any;

  dataSource: Question[] = [];

  displayedColumns: string[] = [
    "number",
    "graded",
    "body",
    "source",
    "comment",
  ];

  sourceText: string;

  foundError: string = "";

  dataIsReadyForImport: boolean = false;

  private static readonly KEY_DIALOG_ONE_QUESTION_MODEL_CONSTRAINTS =
    "oneQuestionModelConstraints";

  private oneQuestionModelConstraintsMap: Map<string, number>;

  static getDialogConfigWithData(
    oneQuestionModelConstraints: Map<string, string>
  ): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "62%";

    dialogConfig.data = new Map<string, any>();
    var constraints = new Map<string, number>();

    for (let key in oneQuestionModelConstraints) {
      let stringConstraintsValue = oneQuestionModelConstraints[key];
      constraints[key] = parseInt(stringConstraintsValue);
    }

    dialogConfig.data[
      QuestionsListImporterComponent.KEY_DIALOG_ONE_QUESTION_MODEL_CONSTRAINTS
    ] = constraints;

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

    var constraintsMap: any = this.getMapValue(
      QuestionsListImporterComponent.KEY_DIALOG_ONE_QUESTION_MODEL_CONSTRAINTS,
      dialogData
    );

    this.oneQuestionModelConstraintsMap = constraintsMap;
  }

  getMapValue(mapKey: string, map: Map<string, string>): string {
    if (mapKey in map && map[mapKey]) {
      return map[mapKey];
    } else {
      return "";
    }
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
    try {
      var questionsImporter = new QuestionsImporter(
        this.sourceText,
        this.oneQuestionModelConstraintsMap
      );
      questionsImporter.doImport();

      this.dataSource = questionsImporter.questions;
    } catch (Error) {
      this.foundError = Error.message;
    }
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