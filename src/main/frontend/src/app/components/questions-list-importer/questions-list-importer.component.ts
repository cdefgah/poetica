import { Component, OnInit, Inject, QueryList } from "@angular/core";
import {
  MatDialogConfig,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";

import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Question } from "src/app/model/Question";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";
import { QuestionsImporter } from "./utils/QuestionsImporter";
import { MessageBoxComponent } from "../message-box/message-box.component";

@Component({
  selector: "app-questions-list-importer",
  templateUrl: "./questions-list-importer.component.html",
  styleUrls: ["./questions-list-importer.component.css"],
})
export class QuestionsListImporterComponent implements OnInit {
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

  ngOnInit() {}

  cancelDialog() {
    var confirmationDialogConfig: MatDialogConfig = ConfirmationDialogComponent.getDialogConfigWithData(
      "Прервать импорт заданий?"
    );

    var dialogRef = this.otherDialog.open(
      ConfirmationDialogComponent,
      confirmationDialogConfig
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // если диалог был принят (accepted)
        this.dialog.close(false);
      }
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

  private processSourceText() {
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
    var confirmationDialogConfig: MatDialogConfig = ConfirmationDialogComponent.getDialogConfigWithData(
      "Импортировать задания?"
    );

    var dialogRef = this.otherDialog.open(
      ConfirmationDialogComponent,
      confirmationDialogConfig
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
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
            (error) => this.displayErrorMessage(error)
          );
      }
    });
  }

  displayErrorMessage(error: any) {
    var errorMessage: string =
      error.error +
      ". " +
      "Код статуса: " +
      error.status +
      ". " +
      "Сообщение сервера: '" +
      error.message +
      "'";

    var msgBoxConfig: MatDialogConfig = MessageBoxComponent.getDialogConfigWithData(
      errorMessage,
      "Ошибка"
    );
  }
}
