import { Component, OnInit, Inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  MatDialogConfig,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";
import { ConfirmationDialogComponent } from "../../core/confirmation-dialog/confirmation-dialog.component";
import { AbstractInteractiveComponentModel } from "src/app/components/core/base/AbstractInteractiveComponentModel";
import { EmailValidationService } from "../../core/validators/EmailValidationService";
import { TeamValidationService } from "../../core/validators/TeamValidationService";
import { AnswerValidationService } from "../../core/validators/AnswerValidationService";
import { debugString, debugObject } from "src/app/utils/Config";
import { EmailSubjectParserParameters } from "./support/email-subject-parser/EmailSubjectParserParameters";
import { EmailSubjectParser } from "./support/email-subject-parser/EmailSubjectParser";
import { TeamDataModel } from "src/app/model/TeamDataModel";
import { EmailBodyParsingResult } from "./support/email-body-parser/EmailBodyParsingResult";
import { EmailBodyParserParameters } from "./support/email-body-parser/EmailBodyParserParameters";
import { EmailBodyParser } from "./support/email-body-parser/EmailBodyParser";
import { AnswerDataModel } from "src/app/model/AnswerDataModel";

@Component({
  selector: "app-answers-list-importer",
  templateUrl: "./answers-list-importer.component.html",
  styleUrls: ["./answers-list-importer.component.css"],
})
export class AnswersListImporterComponent
  extends AbstractInteractiveComponentModel
  implements OnInit {
  //#region ValidatorServices
  emailValidationService: EmailValidationService;
  teamValidationService: TeamValidationService;
  answerValidationService: AnswerValidationService;
  //#endregion

  //#region DataFields
  private teamFromEmailSubject: TeamDataModel;

  // инициализируем пустыми значениями, чтобы связанные компоненты отображались корректно до того, как это поле получит реальное значение
  teamFromEmailBody: TeamDataModel = TeamDataModel.emptyTeam;
  answers: AnswerDataModel[] = [];
  //#endregion

  //#region TemplateFields
  selectedRoundNumber: string; // используется для хранения выбранного варианта
  roundAliasOption: string; // используется для формирования списка вариантов

  emailSentOnDate: any; // содержит только дату отправки письма
  emailSentOnHour: string; // час отправки письма
  emailSentOnMinute: string; // минута отправки письма

  compoundEmailSentOnDate: any; // содержит и дату и время отправки письма

  emailSubject: string;
  emailBody: string;

  allRoundAliases: string[] = ["1", "2"];
  allRoundTitles: string[] = ["Предварительный тур", "Окончательный тур"];

  get selectedRoundTitle(): string {
    if (this.selectedRoundNumber) {
      var index = parseInt(this.selectedRoundNumber) - 1;
      return this.allRoundTitles[index];
    } else {
      return "???";
    }
  }

  private static readonly MAX_HOURS: number = 23;
  private static readonly MAX_MINUTES: number = 59;

  hourOptions: string[] = AnswersListImporterComponent.generateClockOptions(
    AnswersListImporterComponent.MAX_HOURS
  );
  minuteOptions: string[] = AnswersListImporterComponent.generateClockOptions(
    AnswersListImporterComponent.MAX_MINUTES
  );

  displayImportButton: boolean = false;

  displayedAnswerColumns: string[] = ["number", "body", "comment"];

  //#endregion

  //#region Errors handling

  _firstStepErrorMessage: string;
  _secondStepErrorMessage: string;

  get firstStepErrorMessage(): string {
    if (this._firstStepErrorMessage) {
      return this._firstStepErrorMessage;
    } else {
      return "";
    }
  }

  set firstStepErrorMessage(value: string) {
    this._firstStepErrorMessage = value ? value : "";
  }

  get secondStepErrorMessage(): string {
    if (this._secondStepErrorMessage) {
      return this._secondStepErrorMessage;
    } else {
      return "";
    }
  }

  set secondStepErrorMessage(value: string) {
    this._secondStepErrorMessage = value ? value : "";
  }

  get IsFirstStepOk(): boolean {
    return this.firstStepErrorMessage.length == 0;
  }

  get IsSecondStepOk(): boolean {
    return this.secondStepErrorMessage.length == 0;
  }

  get errorPresent(): boolean {
    return !this.IsFirstStepOk || !this.IsSecondStepOk;
  }

  get allThingsAreOk(): boolean {
    return !this.errorPresent;
  }

  get errorsFound(): string {
    return this.firstStepErrorMessage
      .concat(" ")
      .concat(this.secondStepErrorMessage)
      .trim();
  }

  get lastStepTitle(): string {
    if (this.allThingsAreOk) {
      return "Предварительный просмотр и импорт";
    } else {
      return "Информация об ошибках";
    }
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
    private httpClient: HttpClient,
    public dialog: MatDialogRef<AnswersListImporterComponent>,
    public otherDialog: MatDialog
  ) {
    super();
    this.initializeDateHourAndMinuteSelectors();

    this.emailValidationService = new EmailValidationService(this.httpClient);

    if (!this.emailValidationService.isInternalStateCorrect) {
      this.displayMessage(this.emailValidationService.brokenStateDescription);
      return;
    }

    this.teamValidationService = new TeamValidationService(this.httpClient);
    if (!this.teamValidationService.isInternalStateCorrect) {
      this.displayMessage(this.teamValidationService.brokenStateDescription);
      return;
    }

    this.answerValidationService = new AnswerValidationService(this.httpClient);
    if (!this.answerValidationService.isInternalStateCorrect) {
      this.displayMessage(this.answerValidationService.brokenStateDescription);
      return;
    }
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

  onStepChange(event: any) {
    debugString(
      "Importing answers. Event parameter is provided below. onStepChange:: start"
    );
    debugObject(event);

    // если перешли на нулевой шаг с любого
    if (event.selectedIndex == 0) {
      // сбрасываем состояние всех контролирующих переменных
      // и выходим
      debugString("Switched to the first step. Resetting vars and exiting.");
      this.resetStepperVariables(event);
      return;
    }

    if (event.previouslySelectedIndex == 0) {
      // если ушли с первого шага (нулевой индекс), то обрабатываем содержимое письма
      debugString(
        "Moving from the first step. Processing email subject and body."
      );
      this.processEmailSubjectAndBody(
        this.onSuccessfullyEmailSubjectParse,
        this.onEmailParsingFailure
      );
    } else if (event.previouslySelectedIndex == 1) {
      // если ушли со второго шага (индекс == 1), то обрабатываем номер тура и дату/время письма
      debugString(
        "Moving from the second step. Processing email date/time and round number"
      );
      this.processSpecifiedRoundNumberAndEmailDateTime();
    }

    // пересчитываем признак, по которому мы определяем
    // показывать или нет кнопку импорта ответов
    this.updateDisplayImportButton(event);
  }

  private processEmailSubjectAndBody(
    onSuccess: Function,
    onFailure: Function
  ): void {
    debugString("processEmailSubjectAndBody: entering to the method.");

    var emailSubjectParserParameters = new EmailSubjectParserParameters();

    // сохраняем ссылку на этот компонент и передаём её в парсер.
    // парсер затем передаст её в вызываемые функции onSuccess и onFailure.
    // это нужно, чтобы внутри этих функций можно было сослаться на свойства этого компонента.
    emailSubjectParserParameters.parentComponentObject = this;

    emailSubjectParserParameters.emailSubject = this.emailSubject;
    emailSubjectParserParameters.emailValidationService = this.emailValidationService;
    emailSubjectParserParameters.teamValidationService = this.teamValidationService;

    debugString("Initializing the emailSubjectParser object");

    var emailSubjectParser = new EmailSubjectParser(
      emailSubjectParserParameters,
      onSuccess,
      onFailure
    );

    debugString(
      "Launching the email subject parser to do its job. If it succeed, it will continue parsing email body"
    );
    emailSubjectParser.parse();
  }

  /**
   * При передаче ссылки на эту функцию в парсер, мы передаём ссылку на этот компонент.
   * Это нужно для корректных ссылок на свойства текущего компонента,
   * @param parentComponentObject ссылка на этот компонент, хранится в парсере и пробрасывается в вызов этого метода.
   * @param teamObjectFromEmailSubject сформированный объект команды, на базе информации из темы письма.
   * @param roundNumber номер раунда.
   */
  private onSuccessfullyEmailSubjectParse(
    parentComponentObject: AnswersListImporterComponent,
    teamObjectFromEmailSubject: TeamDataModel,
    roundNumber: string
  ) {
    debugString(
      "Email subject parser completed parsing successfully. Team object from the subject line is below."
    );
    debugObject(teamObjectFromEmailSubject);
    debugString(`Round number from the email subject is :${roundNumber}`);

    parentComponentObject.teamFromEmailSubject = teamObjectFromEmailSubject;
    parentComponentObject.selectedRoundNumber = roundNumber;

    debugString(
      `parentComponentObject.allThingsAreOk = ${parentComponentObject.allThingsAreOk}`
    );

    debugString("Preparing email body parser for launch...");

    var emailBodyParserParameters: EmailBodyParserParameters = new EmailBodyParserParameters();
    emailBodyParserParameters.parentComponentObject = parentComponentObject;
    emailBodyParserParameters.emailBody = parentComponentObject.emailBody;
    emailBodyParserParameters.emailValidationService =
      parentComponentObject.emailValidationService;
    emailBodyParserParameters.teamValidationService =
      parentComponentObject.teamValidationService;
    emailBodyParserParameters.answerValidationService =
      parentComponentObject.answerValidationService;

    emailBodyParserParameters.teamFromEmailSubject =
      parentComponentObject.teamFromEmailSubject;
    emailBodyParserParameters.roundNumber =
      parentComponentObject.selectedRoundNumber;

    emailBodyParserParameters.httpClient = parentComponentObject.httpClient;

    debugString("Creating emailBodyParser object");
    var emailBodyParser: EmailBodyParser = new EmailBodyParser(
      emailBodyParserParameters,
      parentComponentObject.onSuccessfullyEmailBodyParse,
      parentComponentObject.onEmailParsingFailure
    );

    debugString("Launching email body parsing ...");
    emailBodyParser.parse();
  }

  private onSuccessfullyEmailBodyParse(
    parentComponentObject: any,
    parsingResult: EmailBodyParsingResult
  ) {
    parentComponentObject.answers = parsingResult.answers;
    parentComponentObject.teamFromEmailBody = parsingResult.team;

    parentComponentObject.firstStepErrorMessage = ""; // нет ошибок

    debugString("Email body parsed successfully");
    debugString(`team: ${parentComponentObject.teamFromEmailBody.toString()}`);
    debugString("Answers listed below");
    debugObject(parentComponentObject.answers);
  }

  /**
   * При передаче ссылки на функцию в парсер, мы передаём ссылку на этот компонент.
   * Это нужно для корректных ссылок на свойства текущего компонента,
   * ибо this в контексте выполнения этого метода будет другим.
   * @param parentComponentObject ссылка на этот компонент, хранится в парсере и пробрасывается в вызов этого метода.
   * @param errorMessage сообщение об ошибке.
   */
  private onEmailParsingFailure(
    parentComponentObject: AnswersListImporterComponent,
    errorMessage: string
  ) {
    debugString(`Email parser failed. Error message: ${errorMessage}`);

    parentComponentObject.firstStepErrorMessage = errorMessage;

    debugString(
      `parentComponentObject.firstStepErrorMessage = ${parentComponentObject.firstStepErrorMessage}`
    );
    debugString(
      `parentComponentObject.allThingsAreOk = ${parentComponentObject.allThingsAreOk}`
    );
  }

  private processSpecifiedRoundNumberAndEmailDateTime(): void {
    debugString("Processing specified round number and email date/time");
    if (this.selectedRoundNumber) {
      debugString(`Round number: ${this.selectedRoundNumber}`);
    } else {
      debugString("Round number is not specified");
      this.secondStepErrorMessage =
        "Не указано на какой раунд (тур) прислано письмо. Предварительный или основной.";
      return;
    }

    debugString("Processing email date/time");
    if (this.emailSentOnDate) {
      debugString(`this.emailSentOnDate = ${this.emailSentOnDate}`);

      var day = this.emailSentOnDate.getDate();
      var month = this.emailSentOnDate.getMonth();
      var year = this.emailSentOnDate.getFullYear();

      if (!this.emailSentOnHour) {
        this.emailSentOnHour = "0";
      }

      if (!this.emailSentOnMinute) {
        this.emailSentOnMinute = "0";
      }

      this.compoundEmailSentOnDate = new Date(
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
      debugString(
        `Compound long-format date: ${this.compoundEmailSentOnDate.getTime()}`
      );
      this.secondStepErrorMessage = ""; // нет никаких ошибок
    } else {
      debugString("Date when email has been sent is not specified");
      this.secondStepErrorMessage = "Не указана дата отправки письма";
    }
  }

  private resetStepperVariables(stepChangeEvent: any): void {
    this.firstStepErrorMessage = "";
    this.secondStepErrorMessage = "";
    this.updateDisplayImportButton(stepChangeEvent);
  }

  private updateDisplayImportButton(stepChangeEvent: any) {
    debugString(
      "*****************************************************************"
    );
    debugString(
      "*****************************************************************"
    );
    debugString(
      "*****************************************************************"
    );
    // последний шаг в степпере имеет индекс 2 (0, 1, 2)
    // кнопку показываем в том случае, если мы пришли на последний шаг
    // и у нас всё в порядке, то есть нет ошибок.
    this.displayImportButton =
      stepChangeEvent.selectedIndex == 2 && this.allThingsAreOk;

    debugString(
      `stepChangeEvent.selectedIndex == ${stepChangeEvent.selectedIndex}`
    );
    debugString(`this.allThingsAreOk == ${this.allThingsAreOk}`);
    debugString(
      `*** stepChangeEvent.selectedIndex == 2 && this.allThingsAreOk ===? ${this.displayImportButton}`
    );
    debugString(
      "*****************************************************************"
    );
    debugString(
      "*****************************************************************"
    );
    debugString(
      "*****************************************************************"
    );
  }

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

  doImportAnswers(): void {
    this.confirmationDialog("Импортировать ответы?", () => {
      // если диалог был принят (accepted)
      // импортируем задания
      const headers = new HttpHeaders().set(
        "Content-Type",
        "application/json; charset=utf-8"
      );

      this.httpClient
        .post("/answers/import", this.answers, { headers: headers })
        .subscribe(
          (data) => {
            this.dialog.close(true);
          },
          (error) => this.reportServerError(error, "Сбой при импорте ответов.")
        );
    });
  }
}
