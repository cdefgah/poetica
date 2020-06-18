import { Component, OnInit, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  MatDialogConfig,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";
import { AnswersImporter } from "./utils/AnswersImporter";
import { AnswersImporterParameters } from "./utils/AnswersImporterParameters";
import { ConfirmationDialogComponent } from "../../core/confirmation-dialog/confirmation-dialog.component";
import { AbstractInteractiveComponentModel } from "src/app/components/core/base/AbstractInteractiveComponentModel";
import { EmailShallowValidationService } from "../../core/validators/EmailShallowValidationService";
import { TeamShallowValidationService } from "../../core/validators/TeamShallowValidationService";
import { AnswerShallowValidationService } from "../../core/validators/AnswerShallowValidationService";
import { RemoteDataValidationService } from "../../core/validators/RemoteDataValidationService";
import { debugString, debugObject } from "src/app/utils/Config";

@Component({
  selector: "app-answers-list-importer",
  templateUrl: "./answers-list-importer.component.html",
  styleUrls: ["./answers-list-importer.component.css"],
})
export class AnswersListImporterComponent
  extends AbstractInteractiveComponentModel
  implements OnInit {
  //#region ValidatorServices
  emailShallowValidationService: EmailShallowValidationService;
  teamShallowValidationService: TeamShallowValidationService;
  answerShallowValidationService: AnswerShallowValidationService;
  remoteDataValidationService: RemoteDataValidationService;
  //#endregion

  //#region TemplateFields
  selectedRoundNumber: string; // используется для хранения выбранного варианта
  roundAliasOption: string; // используется для формирования списка вариантов

  emailSentOnDate: any;
  emailSentOnHour: string;
  emailSentOnMinute: string;

  emailSubject: string;
  emailBody: string;

  allRoundAliases: string[] = ["1", "2"];
  allRoundTitles: string[] = ["Предварительный тур", "Окончательный тур"];

  private static readonly MAX_HOURS: number = 23;
  private static readonly MAX_MINUTES: number = 59;

  hourOptions: string[] = AnswersListImporterComponent.generateClockOptions(
    AnswersListImporterComponent.MAX_HOURS
  );
  minuteOptions: string[] = AnswersListImporterComponent.generateClockOptions(
    AnswersListImporterComponent.MAX_MINUTES
  );

  displayImportButton: boolean = false;
  //#endregion

  //#region ErrorsCollection
  foundErrors: string[];

  get errorsPresent(): boolean {
    return this.foundErrors && this.foundErrors.length > 0;
  }

  get allThingsAreOk(): boolean {
    return !this.errorsPresent;
  }
  //#endregion

  //#region StaticMethodForDialogs
  static getDialogConfigWithData(): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "62%";

    return dialogConfig;
  }
  //#endregion

  //#region ConstructorAndInitializers
  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private http: HttpClient,
    public dialog: MatDialogRef<AnswersListImporterComponent>,
    public otherDialog: MatDialog
  ) {
    super();
    this.initializeDateHourAndMinuteSelectors();

    this.emailShallowValidationService = new EmailShallowValidationService(
      http
    );

    if (!this.emailShallowValidationService.isInternalStateCorrect) {
      this.displayMessage(
        this.emailShallowValidationService.brokenStateDescription
      );
      return;
    }

    this.teamShallowValidationService = new TeamShallowValidationService(http);
    if (!this.teamShallowValidationService.isInternalStateCorrect) {
      this.displayMessage(
        this.teamShallowValidationService.brokenStateDescription
      );
      return;
    }

    this.answerShallowValidationService = new AnswerShallowValidationService(
      http
    );
    if (!this.answerShallowValidationService.isInternalStateCorrect) {
      this.displayMessage(
        this.answerShallowValidationService.brokenStateDescription
      );
      return;
    }

    this.remoteDataValidationService = new RemoteDataValidationService(http);
  }

  protected getMessageDialogReference(): MatDialog {
    return this.otherDialog;
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

  private static generateClockOptions(maxValue: number): any {
    var result: string[] = [];
    var element: string;
    for (let i = 0; i <= maxValue; i++) {
      element = i < 10 ? "0" : "";
      result.push(element + i);
    }

    return result;
  }

  ngOnInit(): void {}
  //#endregion

  ImportAnswers() {}

  private async processEmailSourceText() {
    var parameters: AnswersImporterParameters = new AnswersImporterParameters();
    parameters.http = this.http; // нужно для проверок в базе через REST API
    parameters.emailSubject = this.emailSubject;
    parameters.emailBody = this.emailBody;

    parameters.emailShallowValidationService = this.emailShallowValidationService;
    parameters.teamShallowValidationService = this.teamShallowValidationService;
    parameters.answerShallowValidationService = this.answerShallowValidationService;
    parameters.remoteDataValidationService = this.remoteDataValidationService;

    var answersImporter: AnswersImporter = new AnswersImporter(parameters);
    if (answersImporter.errorsPresent) {
      this.registerFoundErrors(answersImporter.foundErrors);
      return;
    }

    answersImporter.parse();

    this.selectedRoundNumber = answersImporter.getRoundNumber();
  }

  private registerFoundErrors(foundErrorsArray: string[]) {
    if (this.foundErrors) {
      this.foundErrors = this.foundErrors.concat(foundErrorsArray);
    } else {
      this.foundErrors = foundErrorsArray;
    }
  }

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

  async onStepChange(event: any) {
    // если перешли на нулевой шаг с любого
    if (event.selectedIndex == 0) {
      // сбрасываем состояние всех контролирующих переменных
      // и выходим
      this.resetStepperVariables(event);
      return;
    }

    // пересчитываем признак, по которому мы определяем
    // показывать или нет кнопку импорта ответов
    this.updateDisplayImportButton(event);

    if (event.previouslySelectedIndex == 0) {
      // если ушли с первого шага (нулевой индекс), то обрабатываем содержимое письма
    } else if (event.previouslySelectedIndex == 1) {
      // если ушли со второго шага (индекс == 1), то обрабатываем номер тура и дату/время письма
    }

    // if (event.previouslySelectedIndex == 0) {
    //   debugString("Previous Step Index: 0");

    //   this.foundErrors = [];
    //   this.displayImportButton = false;

    //   try {
    //     await this.processEmailSourceText();
    //   } catch (Error) {
    //     console.log("========== EXCEPTION IN processEmailSourceText() ****");
    //     console.dir(Error);
    //     console.log(
    //       "================================================================="
    //     );

    //     this.foundErrors.push(Error.message);
    //   }
    // } else if (event.previouslySelectedIndex == 1) {
    //   debugString("Previous Step Index: 1");

    //   this.processRoundNumberAndEmailDateTime();
    //   this.displayImportButton = true;
    // } else {
    //   debugString(
    //     "ELSE PART: Previous Step Index: " + event.previouslySelectedIndex
    //   );
    // }

    // if (this.foundErrors.length == 0) {
    //   console.log("******** NO IMPORT ERRORS FOUND **************");
    // } else {
    //   console.log("******** IMPORT ERRORS FOUND START **************");
    //   this.foundErrors.map((element) => console.log(element));
    //   console.log("******** IMPORT ERRORS FOUND END **************");
    // }
  }

  private resetStepperVariables(stepChangeEvent: any): void {
    this.foundErrors = [];
    this.updateDisplayImportButton(stepChangeEvent);
  }

  private updateDisplayImportButton(stepChangeEvent: any) {
    // последний шаг в степпере имеет индекс 2 (0, 1, 2)
    // кнопку показываем в том случае, если мы пришли на последний шаг
    // и у нас всё в порядке, то есть нет ошибок.
    this.displayImportButton =
      stepChangeEvent.selectedIndex == 2 && this.allThingsAreOk;
  }

  uploadProcessedDataToTheServer() {}

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
