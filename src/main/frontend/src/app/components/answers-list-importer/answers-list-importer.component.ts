import { Component, OnInit, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  MatDialogConfig,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";
import { FormControl } from "@angular/forms";

@Component({
  selector: "app-answers-list-importer",
  templateUrl: "./answers-list-importer.component.html",
  styleUrls: ["./answers-list-importer.component.css"],
})
export class AnswersListImporterComponent implements OnInit {
  foundError: string = "";
  dataIsReadyForImport: boolean;

  emailSentOnDate: any;
  emailSubject: string;
  emailBody: string;

  allRoundAliases: string[] = ["1", "2"];
  allRoundTitles: string[] = ["Предварительный тур", "Окончательный тур"];
  selectedRoundAlias: string;

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

  hourOptions: string[] = AnswersListImporterComponent.generateClockOptions(23);
  minuteOptions: string[] = AnswersListImporterComponent.generateClockOptions(
    59
  );

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private http: HttpClient,
    public dialog: MatDialogRef<AnswersListImporterComponent>,
    public otherDialog: MatDialog
  ) {
    this.selectedRoundAlias;

    if (!dialogData) {
      return;
    }
  }

  private static generateClockOptions(maxValue): any {
    var result: string[] = [];
    var element: string;
    for (let i = 0; i <= maxValue; i++) {
      element = i < 10 ? "0" : "";
      result.push(element + i);
    }

    return result;
  }

  ngOnInit(): void {}

  ImportAnswers() {}

  private processEmailDateTimeAndRoundNumber() {
    console.log("*******************************************");
    console.log("****** PROCESSING EMAIL DATE AND TIME *****");
    console.log("*******************************************");
  }

  private processEmailSourceText() {
    console.log("++++++++++++++++++++++++++++++++++++++++++++");
    console.log("++++++ PROCESSING EMAIL SUBJ AND BODY ++++++");
    console.log("++++++++++++++++++++++++++++++++++++++++++++");
  }

  onStepChange(event: any) {
    if (event.previouslySelectedIndex == 0) {
      this.processEmailDateTimeAndRoundNumber();
      this.dataIsReadyForImport = false;
    } else if (event.previouslySelectedIndex == 1) {
      this.processEmailSourceText();
      this.dataIsReadyForImport = this.foundError.length == 0;
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
