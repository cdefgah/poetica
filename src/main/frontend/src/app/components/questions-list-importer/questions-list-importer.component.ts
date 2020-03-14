import { Component, OnInit, Inject } from "@angular/core";
import {
  MatDialogConfig,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog
} from "@angular/material/dialog";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Question } from "src/app/model/Question";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: "app-questions-list-importer",
  templateUrl: "./questions-list-importer.component.html",
  styleUrls: ["./questions-list-importer.component.css"]
})
export class QuestionsListImporterComponent implements OnInit {
  public rawTextFormGroup: FormGroup;
  public textValidationFormGroup: FormGroup;

  dataSource: Question[];

  sourceText: string;

  displayedColumns: string[] = ["number", "body", "source", "comment"];

  gradedQuestionsQty: number = 31;
  gradedQuestionsQtyIsIncorrect: boolean = false;

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
    public otherDialog: MatDialog,
    private formBuilder: FormBuilder
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

  ngOnInit() {
    this.rawTextFormGroup = this.formBuilder.group({
      rawTextControl: ["", Validators.required]
    });
  }

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

  onRowClicked(row: any) {}
}
