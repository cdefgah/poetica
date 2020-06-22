import { Component, OnInit, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
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

  //#endregion

  //#region TemplateFields
  isActiveProcessRunning: boolean = false;

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

  //#region Errors handling
  foundError: string = "";

  get errorPresent(): boolean {
    if (this.foundError) {
      return this.foundError.length > 0;
    } else {
      return false;
    }
  }

  get allThingsAreOk(): boolean {
    return !this.errorPresent;
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

  ImportAnswers() {}

  onStepChange(event: any) {
    debugString(
      "Importing answers. Event parameter is provided below. onStepChange:: start"
    );
    debugObject(event);

    // пересчитываем признак, по которому мы определяем
    // показывать или нет кнопку импорта ответов
    this.updateDisplayImportButton(event);

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
        this.onParsingFailure
      );
    } else if (event.previouslySelectedIndex == 1) {
      debugString(
        "Moving from the second step. Processing email date/time and round number"
      );

      // если ушли со второго шага (индекс == 1), то обрабатываем номер тура и дату/время письма
    }
  }

  private processEmailSubjectAndBody(
    onSuccess: Function,
    onFailure: Function
  ): void {
    this.isActiveProcessRunning = true;
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
      this.onSuccessfullyEmailSubjectParse,
      this.onParsingFailure
    );

    debugString("Launching the email subject parser to do its job");
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
    parentComponentObject: any,
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

    parentComponentObject.isActiveProcessRunning = false;
    debugString(
      `parentComponentObject.allThingsAreOk = ${parentComponentObject.allThingsAreOk}`
    );
  }

  private onSuccessfullyEmailBodyParse(
    parentComponentObject: any,
    parsingResult: EmailBodyParsingResult
  ) {}

  /**
   * При передаче ссылки на функцию в парсер, мы передаём ссылку на этот компонент.
   * Это нужно для корректных ссылок на свойства текущего компонента,
   * ибо this в контексте выполнения этого метода будет другим.
   * @param parentComponentObject ссылка на этот компонент, хранится в парсере и пробрасывается в вызов этого метода.
   * @param errorMessage сообщение об ошибке.
   */
  private onParsingFailure(parentComponentObject: any, errorMessage: string) {
    debugString(`Email subject parser failed. Error message: ${errorMessage}`);
    parentComponentObject.foundError = errorMessage;

    parentComponentObject.isActiveProcessRunning = false;
    debugString(
      `parentComponentObject.allThingsAreOk = ${parentComponentObject.allThingsAreOk}`
    );
  }

  private resetStepperVariables(stepChangeEvent: any): void {
    this.foundError = "";
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
