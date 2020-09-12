/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  MatDialogConfig,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../core/confirmation-dialog/confirmation-dialog.component';
import { AbstractInteractiveComponentModel } from 'src/app/components/core/base/AbstractInteractiveComponentModel';
import { EmailValidationService } from '../../core/validators/EmailValidationService';
import { TeamValidationService } from '../../core/validators/TeamValidationService';
import { AnswerValidationService } from '../../core/validators/AnswerValidationService';
import { debugString, debugObject } from 'src/app/utils/Config';
import { EmailBodyParsingResult } from './support/email-body-parser/EmailBodyParsingResult';
import { EmailBodyParserParameters } from './support/email-body-parser/EmailBodyParserParameters';
import { EmailBodyParser } from './support/email-body-parser/EmailBodyParser';
import { TeamDataModel } from 'src/app/data-model/TeamDataModel';
import { AnswerDataModel } from 'src/app/data-model/AnswerDataModel';
import { EmailDataModel } from 'src/app/data-model/EmailDataModel';
import { AnswersImporterDialogResult } from './AnswersImporterDialogResult';

@Component({
  selector: 'app-answers-list-importer',
  templateUrl: './answers-list-importer.component.html',
  styleUrls: ['./answers-list-importer.component.css'],
})
export class AnswersListImporterComponent
  extends AbstractInteractiveComponentModel
  implements OnInit {

  get selectedRoundTitle(): string {
    if (this.selectedRoundNumber) {
      const index = parseInt(this.selectedRoundNumber, 10) - 1;
      return this.allRoundTitles[index];
    } else {
      return '???';
    }
  }

  get firstStepErrorMessage(): string {
    if (this._firstStepErrorMessage) {
      return this._firstStepErrorMessage;
    } else {
      return '';
    }
  }

  set firstStepErrorMessage(value: string) {
    this._firstStepErrorMessage = value ? value : '';
  }

  get secondStepErrorMessage(): string {
    if (this._secondStepErrorMessage) {
      return this._secondStepErrorMessage;
    } else {
      return '';
    }
  }

  set secondStepErrorMessage(value: string) {
    this._secondStepErrorMessage = value ? value : '';
  }

  get IsFirstStepOk(): boolean {
    return this.firstStepErrorMessage.length === 0;
  }

  get IsSecondStepOk(): boolean {
    return this.secondStepErrorMessage.length === 0;
  }

  get errorPresent(): boolean {
    return !this.IsFirstStepOk || !this.IsSecondStepOk;
  }

  get allThingsAreOk(): boolean {
    return !this.errorPresent;
  }

  get errorsFound(): string {
    return this.firstStepErrorMessage
      .concat(' ')
      .concat(this.secondStepErrorMessage)
      .trim();
  }

  get lastStepTitle(): string {
    if (this.allThingsAreOk) {
      return 'Предварительный просмотр и импорт';
    } else {
      return 'Информация об ошибках';
    }
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

  private static readonly MAX_HOURS: number = 23;
  private static readonly MAX_MINUTES: number = 59;
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
  questionNumbersSequence = ''; // номера заданий, на которые даны ответы в импортируемом письме (через запятую)

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

  allRoundAliases: string[] = ['1', '2'];
  allRoundTitles: string[] = ['Предварительный тур', 'Окончательный тур'];

  hourOptions: string[] = AnswersListImporterComponent.generateClockOptions(
    AnswersListImporterComponent.MAX_HOURS
  );
  minuteOptions: string[] = AnswersListImporterComponent.generateClockOptions(
    AnswersListImporterComponent.MAX_MINUTES
  );

  displayImportButton = false;

  displayedAnswerColumns: string[] = ['number', 'body', 'comment'];

  //#endregion

  //#region Errors handling

  _firstStepErrorMessage: string;
  _secondStepErrorMessage: string;
  //#endregion

  //#region StaticMethodForDialogs
  static getDialogConfigWithData(): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '62%';

    return dialogConfig;
  }

  private static generateClockOptions(maxValue: number): any {
    const result: string[] = [];
    let element: string;
    for (let i = 0; i <= maxValue; i++) {
      element = i < 10 ? '0' : '';
      result.push(element + i);
    }

    return result;
  }

  protected getMessageDialogReference(): MatDialog {
    return this.otherDialog;
  }

  private initializeDateHourAndMinuteSelectors() {
    const currentDate: Date = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();

    const currentHourString: string = (currentHour < 10 ? '0' : '') + currentHour;
    const currentMinuteString: string =
      (currentMinute < 10 ? '0' : '') + currentMinute;

    this.emailSentOnDate = currentDate;
    this.emailSentOnHour = currentHourString;
    this.emailSentOnMinute = currentMinuteString;
  }

  ngOnInit(): void { }
  //#endregion

  onStepChange(event: any) {
    debugString(
      'Importing answers. Event parameter is provided below. onStepChange:: start'
    );
    debugObject(event);

    // если перешли на нулевой шаг с любого
    if (event.selectedIndex === 0) {
      // сбрасываем состояние всех контролирующих переменных
      // и выходим
      debugString('Switched to the first step. Resetting vars and exiting.');
      this.resetStepperVariables(event);
      return;
    } else if (event.selectedIndex === 1) {
      // TODO - костыльный код, стыдно, товарищ, непременно переделай как дойдут руки!
      // если пришли на второй шаг (неважно с какого, например с третьего), скрываем кнопку импорта
      this.displayImportButton = false;
    }

    if (event.previouslySelectedIndex === 0) {
      // если ушли с первого шага (нулевой индекс), то обрабатываем содержимое письма
      debugString(
        'Moving from the first step. Processing email body.'
      );
      this.processEmailBody(
        this.onSuccessfullyEmailBodyParse,
        this.onEmailParsingFailure
      );
    } else if (event.previouslySelectedIndex === 1) {
      // если ушли со второго шага (индекс == 1), то обрабатываем номер тура и дату/время письма
      debugString(
        'Moving from the second step. Processing email date/time and round number'
      );
      this.processSpecifiedRoundNumberAndEmailDateTime(
        this.emailUniquenessCheckFailed
      );
    }
  }

  private processEmailBody(
    onSuccess: Function,
    onFailure: Function
  ): void {
    const parentComponentObject: AnswersListImporterComponent = this;

    debugString('Preparing email body parser for launch...');

    const emailBodyParserParameters: EmailBodyParserParameters = new EmailBodyParserParameters();
    emailBodyParserParameters.parentComponentObject = parentComponentObject;
    emailBodyParserParameters.emailBody = parentComponentObject.emailBody;
    emailBodyParserParameters.emailValidationService =
      parentComponentObject.emailValidationService;

    emailBodyParserParameters.answerValidationService =
      parentComponentObject.answerValidationService;

    emailBodyParserParameters.httpClient = parentComponentObject.httpClient;

    debugString('Creating emailBodyParser object');
    const emailBodyParser: EmailBodyParser = new EmailBodyParser(
      emailBodyParserParameters,
      onSuccess,
      onFailure
    );

    debugString('Launching email body parsing ...');
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

    parentComponentObject.firstStepErrorMessage = ''; // нет ошибок

    debugString('Email body parsed successfully');
    debugString(`team: ${parentComponentObject.teamFromEmailBody.toString()}`);
    debugString('Answers listed below');
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
    debugString('Processing specified round number and email date/time');
    if (this.selectedRoundNumber) {
      debugString(`Round number: ${this.selectedRoundNumber}`);
    } else {
      debugString('Round number is not specified');
      this.secondStepErrorMessage =
        'Не указано на какой раунд (тур) прислано письмо. Предварительный или основной.';
      return;
    }

    debugString('Processing email date/time');
    if (this.emailSentOnDate) {
      debugString(`this.emailSentOnDate = ${this.emailSentOnDate}`);

      const day = this.emailSentOnDate.getDate();
      const month = this.emailSentOnDate.getMonth();
      const year = this.emailSentOnDate.getFullYear();

      if (!this.emailSentOnHour) {
        this.emailSentOnHour = '0';
      }

      if (!this.emailSentOnMinute) {
        this.emailSentOnMinute = '0';
      }

      this.compoundEmailSentOnDate = new Date(
        year,
        month,
        day,
        parseInt(this.emailSentOnHour, 10),
        parseInt(this.emailSentOnMinute, 10),
        0,
        0
      );

      // отправляем compoundDate на сервер и строим там java-Date
      // new Date(compoundDate);
      debugString(
        `Compound long-format date: ${this.compoundEmailSentOnDate.getTime()}`
      );

      debugString('Checking email uniqueness...');
      this.validateEmailUniqueness(onEmailUniquenessCheckFailure);
    } else {
      debugString('Date when email has been sent is not specified');
      this.secondStepErrorMessage = 'Не указана дата отправки письма';
    }
  }

  private validateEmailUniqueness(onEmailUniquenessCheckFailure: Function) {
    const thisComponentReference: AnswersListImporterComponent = this;
    const teamId: number = this.teamFromEmailBody.id;
    const roundNumber: string = this.selectedRoundNumber;
    const emailSentOn: number = this.compoundEmailSentOnDate.getTime();

    debugString(' ====================== EMAIL UNIQUENESS CHECKING ============================ ');
    debugString('teamId: ' + teamId);
    debugString('roundNUmber: ' + roundNumber);
    debugString('emailSentOn: ' + emailSentOn);

    const emailUniquenessCheckUrl = `/emails/is-unique/${teamId}/${roundNumber}/${emailSentOn}`;
    debugString('emailUniquenessCheckUrl:' + emailUniquenessCheckUrl);

    thisComponentReference.httpClient.get(emailUniquenessCheckUrl).subscribe(
      (resultFlag: string) => {
        debugString('received resultFlag: ' + resultFlag);
        const resultFlagInNumericForm: number = parseInt(resultFlag, 10);
        debugString('resultFlagInNumericForm: ' + resultFlagInNumericForm);

        if (resultFlagInNumericForm < 0) {
          debugString('Email is not unique...');
          thisComponentReference.displayImportButton = false;

          const errorMessage =
            'В базе данных уже есть загруженное письмо с ответами от этой команды на этот раунд и на это-же время. Проверьте всё ещё раз, пожалуйста.';
          onEmailUniquenessCheckFailure(thisComponentReference, errorMessage);
        } else {
          // письмо уникальное
          debugString('Email is unique...');
          thisComponentReference.displayImportButton = true;
          thisComponentReference.secondStepErrorMessage = '';
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

    debugString('allThingsAreOk before assigning error message: ' + thisComponentReference.allThingsAreOk);
    thisComponentReference.secondStepErrorMessage = errorMessage;
    debugString('allThingsAreOk after assigning error message: ' + thisComponentReference.allThingsAreOk);
  }

  private resetStepperVariables(stepChangeEvent: any): void {
    this.firstStepErrorMessage = '';
    this.secondStepErrorMessage = '';
    this.displayImportButton = false;
  }


  cancelDialog() {
    const confirmationDialogConfig: MatDialogConfig = ConfirmationDialogComponent.getDialogConfigWithData(
      'Прервать импорт ответов?'
    );

    const dialogRef = this.otherDialog.open(
      ConfirmationDialogComponent,
      confirmationDialogConfig
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // если диалог был принят (accepted)
        this.dialog.close(new AnswersImporterDialogResult(false, -1, ''));
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
        oneAnswer.roundNumber = parseInt(this.selectedRoundNumber, 10);
      }
    });
    debugString('Answers after import preparation (check below):');
    debugObject(this.answers);
  }

  doImportAnswers(): void {
    debugString('Confirming the answers import action');
    this.confirmationDialog('Импортировать ответы?', () => {
      // если диалог был принят (accepted)

      debugString('Action confirmed. Preparing email to save in database ...');

      // сперва отправляем присланный email в базу
      const email2Import = new EmailDataModel();
      email2Import.teamId = this.teamFromEmailBody.id;
      email2Import.subject = this.emailSubject;
      email2Import.body = this.emailBody;
      email2Import.roundNumber = parseInt(this.selectedRoundNumber, 10);
      email2Import.sentOn = this.compoundEmailSentOnDate.getTime();
      email2Import.importedOn = new Date().getTime();
      email2Import.questionNumbersSequence = this.questionNumbersSequence;

      debugString('Prepared email object looks like that (check below)');
      debugObject(email2Import);

      // импортируем email
      const headers = new HttpHeaders().set(
        'Content-Type',
        'application/json; charset=utf-8'
      );

      debugString('Sending request to save email in database ...');
      this.httpClient
        .post('/emails/import', email2Import, { headers })
        .subscribe(
          (receivedEmailId) => {
            debugString(
              `Email import request succeed. Now getting the id of saved email. It is: ${receivedEmailId}`
            );

            const emailId: number = parseInt(receivedEmailId.toString(), 10);
            this.prepareAnswersToImport(emailId, email2Import.sentOn);

            debugString(
              'Answers data prepared. Sending the request to the server...'
            );
            // импортируем ответы
            this.httpClient
              .post('/answers/import', this.answers, { headers })
              .subscribe(
                (data) => {
                  debugString('Request succeed. Closing the import dialog.');
                  this.dialog.close(new AnswersImporterDialogResult(true, this.teamFromEmailBody.id, this.selectedRoundNumber));
                },
                (error) => {
                  debugString('Request failed. Error is below:');
                  debugObject(error);
                  this.reportServerError(error, 'Сбой при импорте ответов.');
                }
              );
          },
          (error) => {
            debugString('Email import request failed. Error is below:');
            debugObject(error);
            this.reportServerError(
              error,
              'Сбой при импорте присланного письма.'
            );
          }
        );
    });
  }
}
