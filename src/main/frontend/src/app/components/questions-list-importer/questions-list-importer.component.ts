import { Component, OnInit, Inject } from "@angular/core";
import {
  MatDialogConfig,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog
} from "@angular/material/dialog";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Question } from "src/app/model/Question";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";
import { strict } from "assert";

@Component({
  selector: "app-questions-list-importer",
  templateUrl: "./questions-list-importer.component.html",
  styleUrls: ["./questions-list-importer.component.css"]
})
export class QuestionsListImporterComponent implements OnInit {
  rawSourceTextFormGroup: any;

  dataSource: Question[];

  sourceText: string;

  displayedColumns: string[] = ["number", "body", "source", "comment"];

  gradedQuestionsQty: number;

  questions: Question[] = [];

  foundErrors: string[] = [];

  static getDialogConfigWithData(): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "62%";

    return dialogConfig;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private http: HttpClient,
    public dialog: MatDialogRef<QuestionsListImporterComponent>,
    public otherDialog: MatDialog
  ) {
    this.dataSource = [];

    for (var counter: number = 1; counter < 35; counter++) {
      this.dataSource.push(this.getDummyQuestion(counter));
    }
  }

  getDummyQuestion(index: number): Question {
    var question: Question = new Question();
    question.number = index;
    question.body = "Some body for: " + index;
    question.source = "Some source for " + index;
    question.comment = "Some commend for " + index;

    return question;
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
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // если диалог был принят (accepted)
        this.dialog.close(false);
      }
    });
  }

  onStepChange(event: any) {
    if (event.previouslySelectedIndex == 0) {
      var lines: string[] = this.sourceText.trim().split("\n");
      this.processSourceTextLines(lines);
    }
  }

  private processSourceTextLines(sourceTextLines: string[]) {
    this.foundErrors = [];
    if (sourceTextLines == null || sourceTextLines.length == 0) {
      this.foundErrors.push("Текст с заданиями не задан");
      return;
    }

    const creditedQuestionsAmountPrefix: string = "#G:";
    var firstLine: string = sourceTextLines[0];

    if (firstLine.startsWith(creditedQuestionsAmountPrefix)) {
      var amountString = firstLine
        .substring(
          firstLine.indexOf(creditedQuestionsAmountPrefix) +
            creditedQuestionsAmountPrefix.length
        )
        .trim();
      console.log("AMOUNT - START");

      // конвертируем строку в число

      var incorrectNumericFormat: boolean = false;
      var creditedQuestionsQty: number = 0;

      try {
        creditedQuestionsQty = parseInt(amountString);
      } catch (Exception) {
        incorrectNumericFormat = true;
      }

      if (
        incorrectNumericFormat ||
        !creditedQuestionsQty ||
        creditedQuestionsQty <= 0 ||
        creditedQuestionsQty.toString() !== amountString
      ) {
        this.foundErrors.push(
          "Количество зачётных вопросов должно быть целым положительным числом. А вы указали: " +
            amountString
        );

        console.log("FOUND ERRORS _ START");
        console.log(this.foundErrors);
        console.log("FOUND ERRORS _ END");
        return;
      }

      console.log("|" + amountString + "|");

      console.log(creditedQuestionsQty);
      console.log("AMOUNT - END");

      console.log("FOUND ERRORS _ START");
      console.log(this.foundErrors);
      console.log("FOUND ERRORS _ END");
    }
  }

  onRowClicked(row: any) {}
}
