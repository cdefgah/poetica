import { Component, OnInit, Inject, QueryList } from "@angular/core";
import {
  MatDialogConfig,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";

import { HttpClient } from "@angular/common/http";
import { Question } from "src/app/model/Question";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";
import { QuestionsImporter } from "./utils/QuestionsImporter";

@Component({
  selector: "app-questions-list-importer",
  templateUrl: "./questions-list-importer.component.html",
  styleUrls: ["./questions-list-importer.component.css"],
})
export class QuestionsListImporterComponent implements OnInit {
  rawSourceTextFormGroup: any;

  dataSource: Question[] = [];

  displayedColumns: string[] = ["number", "body", "source", "comment"];

  sourceText: string;

  foundError: string = "";

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
  ) {}

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

      if (this.foundError.length > 0) {
        console.log("+++++ ++ +++  ++  ++  ++  +++ ++++++++++++++");
        console.log(this.foundError);
        console.log("+++++ ++ +++  ++  ++  ++  +++ ++++++++++++++");
      }
    }
  }

  private processSourceText() {
    try {
      var questionsImporter = new QuestionsImporter(this.sourceText);
      questionsImporter.doImport();

      this.dataSource = questionsImporter.questions;
    } catch (Error) {
      this.foundError = Error.message;
    }
  }

  onRowClicked(row: any) {}
}
