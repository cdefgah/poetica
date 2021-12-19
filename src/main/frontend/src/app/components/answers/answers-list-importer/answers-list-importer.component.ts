/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
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
import { EmailValidationService } from '../../core/validators/EmailValidationService';
import { TeamValidationService } from '../../core/validators/TeamValidationService';
import { AnswerValidationService } from '../../core/validators/AnswerValidationService';
import { EmailBodyParsingResult } from './support/email-body-parser/EmailBodyParsingResult';
import { EmailBodyParserParameters } from './support/email-body-parser/EmailBodyParserParameters';
import { EmailBodyParser } from './support/email-body-parser/EmailBodyParser';
import { AnswersImporterDialogResult } from './AnswersImporterDialogResult';
import { TeamDataModel } from '../../../data-model/TeamDataModel';
import { AnswerDataModel } from '../../../data-model/AnswerDataModel';
import { EmailDataModel } from '../../../data-model/EmailDataModel';
import { AbstractInteractiveComponentModel } from '../../core/base/AbstractInteractiveComponentModel';


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
    if (this.firstStepErrorMessageString) {
      return this.firstStepErrorMessageString;
    } else {
      return '';
    }
  }

  set firstStepErrorMessage(value: string) {
    this.firstStepErrorMessageString = value ? value : '';
  }

  get secondStepErrorMessage(): string {
    if (this.secondStepErrorMessageString) {
      return this.secondStepErrorMessageString;
    } else {
      return '';
    }
  }

  set secondStepErrorMessage(value: string) {
    this.secondStepErrorMessageString = value ? value : '';
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
  firstStepErrorMessageString: string;
  secondStepErrorMessageString: string;
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
    // если перешли на нулевой шаг с любого
    if (event.selectedIndex === 0) {
      // сбрасываем состояние всех контролирующих переменных и выходим
      this.resetStepperVariables(event);
      return;

    } else if (event.selectedIndex === 1) {
      // TODO - костыльный код, стыдно, товарищ, непременно переделай как дойдут руки!
      // если пришли на второй шаг (неважно с какого, например с третьего), скрываем кнопку импорта
      this.displayImportButton = false;
    }

    if (event.previouslySelectedIndex === 0) {
      // если ушли с первого шага (нулевой индекс), то обрабатываем содержимое письма
      this.processEmailBody(
        this.onSuccessfullyEmailBodyParse,
        this.onEmailParsingFailure
      );

    } else if (event.previouslySelectedIndex === 1) {
      // если ушли со второго шага (индекс == 1), то обрабатываем номер тура и дату/время письма
      this.processSpecifiedRoundNumberAndEmailDateTime(
        this.emailUniquenessCheckFailed
      );
    }
  }

  private processEmailBody(
    onSuccess: (parentComponentReference: AnswersListImporterComponent, parsingResult: EmailBodyParsingResult) => void,
    onFailure: (parentComponentObject: AnswersListImporterComponent, errorMessage: string) => void): void {
    const parentComponentObject: AnswersListImporterComponent = this;

    const emailBodyParserParameters: EmailBodyParserParameters = new EmailBodyParserParameters();
    emailBodyParserParameters.parentComponentObject = parentComponentObject;
    emailBodyParserParameters.emailBody = parentComponentObject.emailBody;
    emailBodyParserParameters.emailValidationService = parentComponentObject.emailValidationService;

    emailBodyParserParameters.answerValidationService = parentComponentObject.answerValidationService;

    emailBodyParserParameters.httpClient = parentComponentObject.httpClient;

    const emailBodyParser: EmailBodyParser = new EmailBodyParser(
      emailBodyParserParameters,
      onSuccess,
      onFailure
    );

    emailBodyParser.parse();
  }

  private onSuccessfullyEmailBodyParse(
    parentComponentObject: AnswersListImporterComponent,
    parsingResult: EmailBodyParsingResult
  ) {
    parentComponentObject.answers = parsingResult.answers;
    parentComponentObject.teamFromEmailBody = parsingResult.team;
    parentComponentObject.questionNumbersSequence =
      parsingResult.questionNumbersSequenceString;

    parentComponentObject.firstStepErrorMessage = ''; // нет ошибок
  }

  /**
   * При передаче ссылки на функцию в парсер, мы передаём ссылку на этот компонент.
   * Это нужно для корректных ссылок на свойства текущего компонента,
   * ибо this в контексте выполнения этого метода будет другим.
   * @param parentComponentObject ссылка на этот компонент, хранится в парсере и пробрасывается в вызов этого метода.
   * @param errorMessage сообщение об ошибке.
   */
  private onEmailParsingFailure(parentComponentObject: AnswersListImporterComponent, errorMessage: string) {
    parentComponentObject.firstStepErrorMessage = errorMessage;
  }

  /**
   * Обрабатывает номер раунда и время отправки письма.
   * Проверяет, чтобы в базе не было письма от этой-же команды, с этим-же временем отправки, и на этот-же раунд.
   * @param onEmailUniquenessCheckFailure функция, которая будет вызвана в случае ошибки в коде проверки уникальности присланного письма.
   */
  private processSpecifiedRoundNumberAndEmailDateTime(
                        onEmailUniquenessCheckFailure: (componentReference: AnswersListImporterComponent, errorMessage: string) => void
  ): void {

    if (!this.selectedRoundNumber) {
      this.secondStepErrorMessage =
        'Не указано на какой раунд (тур) прислано письмо. Предварительный или основной.';
      return;
    }

    if (this.emailSentOnDate) {
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
      this.validateEmailUniqueness(onEmailUniquenessCheckFailure);
    } else {
      this.secondStepErrorMessage = 'Не указана дата отправки письма';
    }
  }

  private validateEmailUniqueness(onEmailUniquenessCheckFailure: 
        (componentReference: AnswersListImporterComponent, errorMessage: string) => void) {

    const thisComponentReference: AnswersListImporterComponent = this;
    const teamId: number = this.teamFromEmailBody.id;
    const roundNumber: string = this.selectedRoundNumber;
    const emailSentOn: number = this.compoundEmailSentOnDate.getTime();

    const emailUniquenessCheckUrl = `/emails/is-unique/${teamId}/${roundNumber}/${emailSentOn}`;

    thisComponentReference.httpClient.get(emailUniquenessCheckUrl).subscribe(
      (resultFlag: string) => {
        const resultFlagInNumericForm: number = parseInt(resultFlag, 10);

        if (resultFlagInNumericForm < 0) {
          thisComponentReference.displayImportButton = false;

          const errorMessage =
            'В базе данных уже есть загруженное письмо с ответами от этой команды на этот раунд и на это-же время. Проверьте всё ещё раз, пожалуйста.';
          onEmailUniquenessCheckFailure(thisComponentReference, errorMessage);
        } else {
          // письмо уникальное
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

  private emailUniquenessCheckFailed(thisComponentReference: AnswersListImporterComponent, errorMessage: string) {
    thisComponentReference.secondStepErrorMessage = errorMessage;
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
  }

  doImportAnswers(): void {
    this.confirmationDialog('Импортировать ответы?', () => {
      // если диалог был принят (accepted)

      // сперва отправляем присланный email в базу
      const email2Import = new EmailDataModel();
      email2Import.teamId = this.teamFromEmailBody.id;
      email2Import.subject = this.emailSubject;
      email2Import.body = this.emailBody;
      email2Import.roundNumber = parseInt(this.selectedRoundNumber, 10);
      email2Import.sentOn = this.compoundEmailSentOnDate.getTime();
      email2Import.importedOn = new Date().getTime();
      email2Import.questionNumbersSequence = this.questionNumbersSequence;

      // импортируем email
      const headers = new HttpHeaders().set(
        'Content-Type',
        'application/json; charset=utf-8'
      );

      this.httpClient
        .post('/emails/import', email2Import, { headers })
        .subscribe(
          (receivedEmailId) => {

            const emailId: number = parseInt(receivedEmailId.toString(), 10);
            this.prepareAnswersToImport(emailId, email2Import.sentOn);

            // импортируем ответы
            this.httpClient
              .post('/answers/import', this.answers, { headers })
              .subscribe(
                () => this.dialog.close(new AnswersImporterDialogResult(true, this.teamFromEmailBody.id, this.selectedRoundNumber)),
                (error) => this.reportServerError(error, 'Сбой при импорте ответов.')
              );
          },
          (error) => this.reportServerError(error, 'Сбой при импорте присланного письма.')
        );
    });
  }
}
