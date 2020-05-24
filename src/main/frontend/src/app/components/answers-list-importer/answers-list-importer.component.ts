import { Component, OnInit, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  MatDialogConfig,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: "app-answers-list-importer",
  templateUrl: "./answers-list-importer.component.html",
  styleUrls: ["./answers-list-importer.component.css"],
})
export class AnswersListImporterComponent implements OnInit {
  rawSourceTextFormGroup: any;
  foundError: string;
  dataIsReadyForImport: boolean;

  emailDate: any;
  emailSubject: string;
  emailBody: string;

  static getDialogConfigWithData(
    answerAndEmailModelConstraints: Map<string, string>
  ): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "62%";

    dialogConfig.data = new Map<string, any>();
    var constraints = new Map<string, number>();

    for (let key in answerAndEmailModelConstraints) {
      let stringConstraintsValue = answerAndEmailModelConstraints[key];
      constraints[key] = parseInt(stringConstraintsValue);
    }

    //    dialogConfig.data[
    //      QuestionsListImporterComponent.KEY_DIALOG_ONE_QUESTION_MODEL_CONSTRAINTS
    //    ] = constraints;

    return dialogConfig;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private http: HttpClient,
    public dialog: MatDialogRef<AnswersListImporterComponent>,
    public otherDialog: MatDialog
  ) {
    if (!dialogData) {
      return;
    }
  }

  ngOnInit(): void {}

  ImportAnswers() {}

  private processSourceText() {}

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

  doImportAnswers() {}

  cancelDialog() {
    var confirmationDialogConfig: MatDialogConfig = ConfirmationDialogComponent.getDialogConfigWithData(
      "Прервать импорт ответов?"
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
}
