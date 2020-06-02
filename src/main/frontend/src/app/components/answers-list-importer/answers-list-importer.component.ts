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
  private static readonly CONSTRAINTS_ALL = "all-constraints";
  private static readonly CONSTRAINTS_TEAM = "team-constraints";
  private static readonly CONSTRAINTS_EMAIL = "email-constraints";
  private static readonly CONSTRAINTS_ANSWER = "answer-constraints";

  answerConstraints: Map<string, number>;
  emailConstraints: Map<string, number>;

  foundErrors: string[];
  dataIsReadyForImport: boolean;

  selectedRoundNumber: string;

  emailSentOnDate: any;
  emailSentOnHour: string;
  emailSentOnMinute: string;

  emailSubject: string;
  emailBody: string;

  allRoundAliases: string[] = ["1", "2"];
  allRoundTitles: string[] = ["Предварительный тур", "Окончательный тур"];
  selectedRoundAlias: string;

  static getDialogConfigWithData(
    teamModelConstraints: Map<string, string>,
    emailModelConstraints: Map<string, string>,
    answerModelConstraints: Map<string, string>
  ): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "62%";

    dialogConfig.data = new Map<string, any>();
    var constraints = new Map<string, Map<string, number>>();

    constraints[
      AnswersListImporterComponent.CONSTRAINTS_TEAM
    ] = teamModelConstraints;

    constraints[
      AnswersListImporterComponent.CONSTRAINTS_EMAIL
    ] = emailModelConstraints;
    constraints[
      AnswersListImporterComponent.CONSTRAINTS_ANSWER
    ] = answerModelConstraints;

    dialogConfig.data[
      AnswersListImporterComponent.CONSTRAINTS_ALL
    ] = constraints;

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
    if (!dialogData) {
      return;
    }

    this.initializeDateHourAndMinuteSelectors();

    var allConstraints =
      dialogData[AnswersListImporterComponent.CONSTRAINTS_ALL];

    this.emailConstraints = AnswersListImporterComponent.convertMap(
      allConstraints[AnswersListImporterComponent.CONSTRAINTS_EMAIL]
    );

    this.answerConstraints = AnswersListImporterComponent.convertMap(
      allConstraints[AnswersListImporterComponent.CONSTRAINTS_ANSWER]
    );
  }

  private initializeDateHourAndMinuteSelectors() {
    var currentDate: Date = new Date();
    var currentHour = currentDate.getHours();
    var currentMinute = currentDate.getMinutes();

    var currentHourString: string = (currentHour < 10 ? "0" : "") + currentHour;
    var currentMinuteString: string =
      (currentMinute < 10 ? "0" : "") + currentMinute;

    this.emailSentOnDate = currentDate;
    this.emailSentOnHour = currentHourString;
    this.emailSentOnMinute = currentMinuteString;
  }

  private static convertMap(
    sourceMap: Map<string, string>
  ): Map<string, number> {
    var constraints = new Map<string, number>();
    for (let key in sourceMap) {
      let stringConstraintsValue = sourceMap[key];
      constraints[key] = parseInt(stringConstraintsValue);
    }
    return constraints;
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

  private processRoundNumberAndEmailDateTime() {
    console.log("*** PROCESSING ROUND NUMBER AND DATE TIME **********");
    if (this.selectedRoundNumber) {
      console.log("ROUND NUMBER: " + this.selectedRoundNumber);
    } else {
      console.log("**** ERROR: Round number is not specified!");
      this.foundErrors.push(
        "Не указано на какой раунд (тур) прислано письмо. Предварительный или основной."
      );
    }

    if (this.emailSentOnDate) {
      console.log("this.emailSentOnDate = " + this.emailSentOnDate);

      var day = this.emailSentOnDate.getDate();
      var month = this.emailSentOnDate.getMonth();
      var year = this.emailSentOnDate.getFullYear();

      if (!this.emailSentOnHour) {
        this.emailSentOnHour = "0";
      }

      if (!this.emailSentOnMinute) {
        this.emailSentOnMinute = "0";
      }

      var compoundDate = new Date(
        year,
        month,
        day,
        parseInt(this.emailSentOnHour),
        parseInt(this.emailSentOnMinute),
        0,
        0
      );

      // отправляем compoundDate на сервер и строим там java-Date
      // new Date(compoundDate);
      console.log("**********************");
      console.log("compound date: " + compoundDate.getTime());
      console.log("**********************");
    } else {
      console.log("ERROR: EMAIL DATE IS NOT SET");
      this.foundErrors.push("Не указана дата отправки письма");
    }
    console.log("***************************************************");
  }

  private processEmailSourceText() {
    console.log("++++++++++++++++++++++++++++++++++++++++++++");
    console.log("++++++ PROCESSING EMAIL SUBJ AND BODY ++++++");
    console.log("++++++++++++++++++++++++++++++++++++++++++++");
  }

  onStepChange(event: any) {
    if (event.previouslySelectedIndex == 0) {
      this.foundErrors = [];
      this.dataIsReadyForImport = false;
      this.processEmailSourceText();
    } else if (event.previouslySelectedIndex == 1) {
      this.processRoundNumberAndEmailDateTime();
      this.dataIsReadyForImport = this.foundErrors.length == 0;
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
