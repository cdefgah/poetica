/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { Component, OnInit } from '@angular/core';
import { AbstractInteractiveComponentModel } from '../core/base/AbstractInteractiveComponentModel';
import { MatDialog } from '@angular/material';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css'],
})
export class ToolsComponent extends AbstractInteractiveComponentModel implements OnInit {

  constructor(private httpClient: HttpClient, private dialog: MatDialog) {
    super();
  }

  backgroundColorForRowWithGradedQuestion: string;
  backgroundColorForRowWithNonGradedQuestion: string;

  acceptedAnswerBackgroundColor: string;
  notAcceptedAnswerBackgroundColor: string;
  notGradedAnswerBackgroundColor: string;

  cpDisplayMode = 'popup';
  cpPositionMode = 'left';
  cpAlphaChannelMode = 'disabled';

  dbResetSpellWord: string;

  ngOnInit() {
    this.loadBackgroundColorsForQuestionsTable();
    this.loadBackgroundColorsForAnswersTable();
  }

  private loadBackgroundColorsForQuestionsTable() {
    const questionСolorsUrl = '/configuration/colors-for-questions';
    this.httpClient.get(questionСolorsUrl).subscribe(
      (colorMap) => {
        const keyBackgroundColorForGradedRow = 'configKeyGradedQuestionBackgroundColor';
        const keyBackgroundColorForNonGradedRow = 'configKeyNonGradedQuestionBackgroundColor';

        this.backgroundColorForRowWithGradedQuestion = colorMap[keyBackgroundColorForGradedRow];
        this.backgroundColorForRowWithNonGradedQuestion = colorMap[keyBackgroundColorForNonGradedRow];
      },
      (error) => this.reportServerError(error)
    );
  }

  private loadBackgroundColorsForAnswersTable() {
    const answerColorsUrl = '/configuration/colors-for-answers';
    this.httpClient.get(answerColorsUrl).subscribe(
      (colorMap) => {
        const keyBackgroundColorForAcceptedAnswer = 'configKeyBackgroundColorForAcceptedAnswer';
        const keyBackgroundColorForNotAcceptedAnswer = 'configKeyBackgroundColorForNotAcceptedAnswer';
        const keyBackgroundColorForNotGradedAnswer = 'configKeyBackgroundColorForNotGradedAnswer';

        this.acceptedAnswerBackgroundColor = colorMap[keyBackgroundColorForAcceptedAnswer];
        this.notAcceptedAnswerBackgroundColor = colorMap[keyBackgroundColorForNotAcceptedAnswer];
        this.notGradedAnswerBackgroundColor = colorMap[keyBackgroundColorForNotGradedAnswer];
      },
      (error) => this.reportServerError(error)
    );
  }

  protected getMessageDialogReference(): MatDialog {
    return this.dialog;
  }

  onBackgroundColorForNonGradedQuestionSelected(selectedColor: string) {
    this.backgroundColorForRowWithNonGradedQuestion = selectedColor;
    this.updateConfiguration('configKeyNonGradedQuestionBackgroundColor', selectedColor);
  }

  onBackgroundColorForGradedQuestionSelected(selectedColor: string) {
    this.backgroundColorForRowWithGradedQuestion = selectedColor;
    this.updateConfiguration('configKeyGradedQuestionBackgroundColor', selectedColor);
  }

  onBackgroundColorForAcceptedAnswerSelected(selectedColor: string) {
    this.acceptedAnswerBackgroundColor = selectedColor;
    this.updateConfiguration('configKeyBackgroundColorForAcceptedAnswer', selectedColor);
  }

  onBackgroundColorForNotAcceptedAnswerSelected(selectedColor: string) {
    this.notAcceptedAnswerBackgroundColor = selectedColor;
    this.updateConfiguration('configKeyBackgroundColorForNotAcceptedAnswer', selectedColor);
  }

  onBackgroundColorForNotGradedAnswerSelected(selectedColor: string) {
    this.notGradedAnswerBackgroundColor = selectedColor;
    this.updateConfiguration('configKeyBackgroundColorForNotGradedAnswer', selectedColor);
  }

  private updateConfiguration(key: string, value: string) {
    const requestUrl = `/configuration/updateConfig/${key}`;
    const payload = new HttpParams()
          .set('configValue', value);

    this.httpClient.put(requestUrl, payload).subscribe(
      (error) => this.reportServerError(error)
    );
  }

  resetQuestionColorsToDefaults() {
    const confirmationMessage = `Сбросить настройки цвета для списка заданий в значения по-умолчанию?`;

    const dialogAcceptedAction = () => {
     // если диалог был принят (accepted), сбрасываем в значения по-умолчанию.
     const url = '/configuration/reset-colors-for-questions';
     this.httpClient.post(url, null).subscribe(() => {
       // заново загружаем значения цветов для заданий, после сброса
       this.loadBackgroundColorsForQuestionsTable();
     });
   };

    this.confirmationDialog(confirmationMessage, dialogAcceptedAction);
  }

  resetAnswerColorsToDefaults() {
    const confirmationMessage = `Сбросить настройки цвета для списков ответов в значения по-умолчанию?`;

    const dialogAcceptedAction = () => {
     // если диалог был принят (accepted), сбрасываем в значения по-умолчанию.
     const url = '/configuration/reset-colors-for-answers';
     this.httpClient.post(url, null).subscribe(() => {
       // заново загружаем значения цветов для списков ответов, после сброса
       this.loadBackgroundColorsForAnswersTable();
     });
   };

    this.confirmationDialog(confirmationMessage, dialogAcceptedAction);    
  }

  resetDatabase() {
    const correctSpellWord = 'Удалить все ответы и письма';

    if (correctSpellWord !== this.dbResetSpellWord) {
      this.displayMessage('Пожалуйста впишите требуемый текст с соблюдением регистра букв, без лишних пробелов, без кавычек и попробуйте снова.', 'Внимание');
      return;
    }

    const confirmationMessage = `Все загруженные письма и ответы будут безвозвратно удалены из базы. Продолжать?`;

    const dialogAcceptedAction = () => {
     // если диалог был принят (accepted)
     const url = '/configuration/reset-database-state';
     this.httpClient.post(url, null).subscribe(() => {
      this.dbResetSpellWord = '';
      this.displayMessage('Операция выполнена успешно', 'Сброс состояния базы');
     },
     (error) => this.reportServerError(error));
   };

    this.confirmationDialog(confirmationMessage, dialogAcceptedAction);
  }
}
