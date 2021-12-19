/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogConfig,
  MatDialog,
} from '@angular/material/dialog';
import { HttpClient, HttpParams } from '@angular/common/http';
import { QuestionValidationService } from '../../core/validators/QuestionValidationService';
import { MatRadioChange } from '@angular/material/radio';
import { AbstractInteractiveComponentModel } from '../../core/base/AbstractInteractiveComponentModel';
import { QuestionDataModel } from '../../../data-model/QuestionDataModel';

@Component({
  selector: 'app-question-details',
  templateUrl: './question-details.component.html',
  styleUrls: ['./question-details.component.css'],
})
export class QuestionDetailsComponent extends AbstractInteractiveComponentModel
  implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private http: HttpClient,
    public dialog: MatDialogRef<QuestionDetailsComponent>,
    public otherDialog: MatDialog
  ) {
    super();

    // инициализируем объект question сразу первой строчкой
    // так как к нему подключены (bind)
    // свойства в html-template комепонента
    // и если не проинициализировать объект сразу
    // то компонент может попытаться (асинхронно) получить свойство
    // объекта, который мы ещё не проинициализировали,
    // например в случаях, когда get запрос ещё не закончил выполняться
    this.question = QuestionDataModel.emptyQuestion;

    this.questionValidationService =
      dialogData[QuestionDetailsComponent.KEY_DIALOG_MODEL_VALIDATOR_SERVICE];

    const questionId = dialogData[QuestionDetailsComponent.KEY_DIALOG_ID];

    if (questionId) {
      // редактируем существующее задание
      const url = `/questions/${questionId}`;
      this.http.get(url).subscribe(
        (data: Map<string, any>) => {
          this.question = QuestionDataModel.createQuestionFromMap(data);
          this.questionCopy = QuestionDataModel.createQuestionFromMap(data);

          this.dialogTitle = this.getDialogTitle(this.question);

          if (!this.question.graded) {
            this.selectedGradeStateAlias =
              QuestionDetailsComponent.KEY_ALIAS_NOT_GRADED;
          }
        },
        (error) => this.reportServerError(error)
      );
    } else {
      // создаём объект задания и заголовок диалога для нового задания
      this.question = QuestionDataModel.createQuestion();
      this.dialogTitle = this.getDialogTitle(this.question);
    }
  }
  private static readonly KEY_DIALOG_ID = 'id';
  private static readonly KEY_DIALOG_MODEL_VALIDATOR_SERVICE = 'modelValidatorService';

  private static KEY_ALIAS_GRADED = '1';
  private static KEY_ALIAS_NOT_GRADED = '0';

  dialogTitle: string;

  question: QuestionDataModel;
  questionCopy: QuestionDataModel; // используется для сравнения, были-ли изменения при редактировании

  questionValidationService: QuestionValidationService;

  selectedGradeStateAlias: string = QuestionDetailsComponent.KEY_ALIAS_GRADED;

  allGradeStateAliases: string[] = [
    QuestionDetailsComponent.KEY_ALIAS_GRADED,
    QuestionDetailsComponent.KEY_ALIAS_NOT_GRADED,
  ];
  allGradeStates: string[] = ['Зачётное', 'Внезачётное'];

  modelConstraints: Map<string, number>;

  questionBodyIsIncorrect = false;
  authorsAnswerIsIncorrect = false;
  questionSourceIsIncorrect = false;
  authorsInfoIsIncorrect = false;

  serverResponse: any;

  static getDialogConfigWithData(
    questionValidationService: QuestionValidationService,
    row?: any
  ): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '62%';

    dialogConfig.data = new Map<string, any>();

    dialogConfig.data[
      QuestionDetailsComponent.KEY_DIALOG_MODEL_VALIDATOR_SERVICE
    ] = questionValidationService;

    if (row) {
      dialogConfig.data[QuestionDetailsComponent.KEY_DIALOG_ID] = row[QuestionDetailsComponent.KEY_DIALOG_ID];
    }

    return dialogConfig;
  }

  protected getMessageDialogReference(): MatDialog {
    return this.otherDialog;
  }

  ngOnInit() { }

  private getDialogTitle(questionObject: QuestionDataModel): string {
    if (questionObject.externalNumber.length === 0) {
      return 'Новое задание';
    } else {
      const isGradedString = questionObject.graded
        ? ' (Зачётное)'
        : ' (Внезачётное)';

      return `Задание №${String(
        questionObject.externalNumber
      )}${isGradedString}`;
    }
  }

  acceptDialog() {
    this.resetValidationFlags();
    if (this.validateFields()) {
      // обновляем существующую запись
      const newQuestionTitle: string =
        this.questionCopy.title !== this.question.title
          ? this.question.title
          : '';

      const updateQuestionTitle: boolean =
        this.questionCopy.title !== this.question.title;

      const updateGradedState = this.questionCopy.graded !== this.question.graded;

      const newQuestionBody: string =
        this.questionCopy.body !== this.question.body ? this.question.body : '';

      const newAuthorsAnswer: string =
        this.questionCopy.authorsAnswer !== this.question.authorsAnswer
          ? this.question.authorsAnswer : '';

      const newQuestionSource: string =
        this.questionCopy.source !== this.question.source
          ? this.question.source
          : '';

      const newQuestionComment: string =
        this.questionCopy.comment !== this.question.comment
          ? this.question.comment
          : '';

      const updateComment: boolean =
        this.questionCopy.comment !== this.question.comment;

      const newAuthorsInfo: string =
        this.questionCopy.authorInfo !== this.question.authorInfo ? this.question.authorInfo : '';

      if (
        updateQuestionTitle ||
        updateGradedState ||
        newQuestionBody.length > 0 ||
        newAuthorsAnswer.length > 0 ||
        newQuestionSource.length > 0 ||
        updateComment ||
        newAuthorsInfo.length > 0
      ) {
        // данные изменились, обновляем их на сервере
        const requestUrl = `/questions/${this.question.id}`;
        const payload = new HttpParams()
          .set('updateQuestionTitle', String(updateQuestionTitle))
          .set('newQuestionTitle', newQuestionTitle)
          .set('updateGradedState', String(updateGradedState))
          .set('newGradedState', String(this.question.graded))
          .set('newQuestionBody', newQuestionBody)
          .set('newAuthorsAnswer', newAuthorsAnswer)
          .set('newQuestionSource', newQuestionSource)
          .set('updateComment', String(updateComment))
          .set('newQuestionComment', newQuestionComment)
          .set('newAuthorsInfo', newAuthorsInfo);

        this.http.put(requestUrl, payload).subscribe(
          () => {
            this.dialog.close(true);
          },
          (error) => this.reportServerError(error)
        );
      } else {
        // никаких изменений не было
        // закрываем и не делаем лишнего запроса для обновления данных с сервера
        this.dialog.close(false);
      }
    }
  }

  cancelDialog() {
    this.dialog.close(false);
  }

  /**
   * Выполняет сброс флагов валидации,
   * чтобы не подсвечивались подписи для незаполненных полей.
   */
  private resetValidationFlags() {
    this.questionBodyIsIncorrect = false;
    this.questionSourceIsIncorrect = false;
  }

  /**
   * Выполняет проверку заполненности полей.
   * @returns true, если поля заполнены, иначе false.
   */
  private validateFields(): boolean {

    this.questionBodyIsIncorrect = this.question.body.trim().length === 0;
    this.authorsAnswerIsIncorrect = this.question.authorsAnswer.trim().length === 0;
    this.questionSourceIsIncorrect = this.question.source.trim().length === 0;
    this.authorsInfoIsIncorrect = this.question.authorInfo.trim().length === 0;

    return !(this.questionBodyIsIncorrect || this.authorsAnswerIsIncorrect ||
      this.questionSourceIsIncorrect || this.authorsInfoIsIncorrect);
  }

  gradedStateChanged(event: MatRadioChange) {
    this.question.graded =
      event.value === QuestionDetailsComponent.KEY_ALIAS_GRADED;
  }
}
