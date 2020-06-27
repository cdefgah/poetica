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
import { EmailDataModel } from "src/app/model/EmailDataModel";

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
  questionNumbersSequence: string = ""; // номера заданий, на которые даны ответы в импортируемом письме (через запятую)

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
      this.processSpecifiedRoundNumberAndEmailDateTime(
        this.emailUniquenessCheckFailed
      );
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
    parentComponentObject.questionNumbersSequence =
      parsingResult.questionNumbersSequenceString;

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

  /**
   * Обрабатывает номер раунда и время отправки письма.
   * Проверяет, чтобы в базе не было письма от этой-же команды, с этим-же временем отправки, и на этот-же раунд.
   * @param onEmailUniquenessCheckFailure функция, которая будет вызвана в случае ошибки в коде проверки уникальности присланного письма.
   */
  private processSpecifiedRoundNumberAndEmailDateTime(
    onEmailUniquenessCheckFailure: Function
  ): void {
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

      debugString("Checking email uniqueness...");
      this.validateEmailUniqueness(onEmailUniquenessCheckFailure);
    } else {
      debugString("Date when email has been sent is not specified");
      this.secondStepErrorMessage = "Не указана дата отправки письма";
    }
  }

  private validateEmailUniqueness(onEmailUniquenessCheckFailure: Function) {
    var thisComponentReference: AnswersListImporterComponent = this;
    var teamId: number = this.teamFromEmailBody.id;
    var roundNumber: string = this.selectedRoundNumber;
    var emailSentOn: number = this.compoundEmailSentOnDate;

    const emailUniquenessCheckUrl: string = `/emails/is-unique/${teamId}/${roundNumber}/${emailSentOn}`;
    thisComponentReference.httpClient.get(emailUniquenessCheckUrl).subscribe(
      (resultFlag: string) => {
        const emailIsUnique: string = "1";
        if (resultFlag == emailIsUnique) {
        } else {
          var errorMessage: string =
            "В базе данных уже есть загруженное письмо с ответами от этой команды на этот раунд и на это-же время. Проверьте всё ещё раз, пожалуйста.";
          onEmailUniquenessCheckFailure(thisComponentReference, errorMessage);
        }
      },
      (error) => {
        thisComponentReference.reportServerError(error);
        onEmailUniquenessCheckFailure(thisComponentReference, error.message);
      }
    );
  }

  private emailUniquenessCheckFailed(
    thisComponentReference: AnswersListImporterComponent,
    errorMessage: string
  ) {
    debugString(
      `Email uniqueness check failed. Error message: ${errorMessage}`
    );
    thisComponentReference.secondStepErrorMessage = errorMessage;
  }

  private resetStepperVariables(stepChangeEvent: any): void {
    this.firstStepErrorMessage = "";
    this.secondStepErrorMessage = "";
    this.updateDisplayImportButton(stepChangeEvent);
  }

  private updateDisplayImportButton(stepChangeEvent: any) {
    // последний шаг в степпере имеет индекс 2 (0, 1, 2)
    // кнопку показываем в том случае, если мы пришли на последний шаг
    // и у нас всё в порядке, то есть нет ошибок.
    this.displayImportButton =
      stepChangeEvent.selectedIndex == 2 && this.allThingsAreOk;
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

  /**
   * Дополняет информацию в ответах (id-письма, время отправки письма с ответом, id-команды, раунд) перед загрузкой на сервер.
   */
  private prepareAnswersToImport(emailId: number, emailSentOn: number): void {
    this.answers.forEach((oneAnswer) => {
      oneAnswer.emailId = emailId;
      oneAnswer.emailSentOn = emailSentOn;
      oneAnswer.teamId = this.teamFromEmailBody.id;
      if (!oneAnswer.roundNumber) {
        // если раунд не прописан при разборе письма (в теме может быть задан)
        // проставляем его явно
        oneAnswer.roundNumber = parseInt(this.selectedRoundNumber);
      }
    });
    debugString("Answers after import preparation (check below):");
    debugObject(this.answers);
  }

  doImportAnswers(): void {
    debugString("Confirming the answers import action");
    this.confirmationDialog("Импортировать ответы?", () => {
      // если диалог был принят (accepted)

      debugString("Action confirmed. Preparing email to save in database ...");

      // сперва отправляем присланный email в базу
      var email2Import = new EmailDataModel();
      email2Import.teamId = this.teamFromEmailBody.id;
      email2Import.subject = this.emailSubject;
      email2Import.body = this.emailBody;
      email2Import.roundNumber = parseInt(this.selectedRoundNumber);
      email2Import.sentOn = this.compoundEmailSentOnDate.getTime();
      email2Import.importedOn = new Date().getTime();
      email2Import.questionNumbersSequence = this.questionNumbersSequence;

      debugString("Prepared email object looks like that (check below)");
      debugObject(email2Import);

      // импортируем email
      const headers = new HttpHeaders().set(
        "Content-Type",
        "application/json; charset=utf-8"
      );

      debugString("Sending request to save email in database ...");
      this.httpClient
        .post("/emails/import", email2Import, { headers: headers })
        .subscribe(
          (receivedEmailId) => {
            debugString(
              `Email import request succeed. Now getting the id of saved email. It is: ${receivedEmailId}`
            );

            var emailId: number = parseInt(receivedEmailId.toString());
            this.prepareAnswersToImport(emailId, email2Import.sentOn);

            debugString(
              "Answers data prepared. Sending the request to the server..."
            );
            // импортируем ответы
            this.httpClient
              .post("/answers/import", this.answers, { headers: headers })
              .subscribe(
                (data) => {
                  debugString("Request succeed. Closing the import dialog.");
                  this.dialog.close(true);
                },
                (error) => {
                  debugString("Request failed. Error is below:");
                  debugObject(error);
                  this.reportServerError(error, "Сбой при импорте ответов.");
                }
              );
          },
          (error) => {
            debugString("Email import request failed. Error is below:");
            debugObject(error);
            this.reportServerError(
              error,
              "Сбой при импорте присланного письма."
            );
          }
        );
    });
  }
}
