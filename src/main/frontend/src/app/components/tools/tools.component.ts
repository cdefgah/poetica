/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { Component, OnInit } from '@angular/core';
import { AbstractInteractiveComponentModel } from '../core/base/AbstractInteractiveComponentModel';
import { MatDialog } from '@angular/material';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css'],
})
export class ToolsComponent extends AbstractInteractiveComponentModel implements OnInit {

  constructor(private httpClient: HttpClient, private dialog: MatDialog) {
    super();
  }

  public appVersion: string;

  // наименование этого свойства может вводить в заблуждение
  // так как оно привязано к collapsed и при false
  // элемент будет именно collpased.
  // но это глюк в самом компоненте color-picker-а.
  public isColorPickerOpenedInitially = false;

  backgroundColorForRowWithGradedQuestion: string;
  backgroundColorForRowWithNotGradedQuestion: string;

  acceptedAnswerBackgroundColor: string;
  notAcceptedAnswerBackgroundColor: string;
  notGradedAnswerBackgroundColor: string;

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
        this.backgroundColorForRowWithNotGradedQuestion = colorMap[keyBackgroundColorForNonGradedRow];
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

  onBackgroundColorForNotGradedQuestionSelected(selectedColor) {
    this.backgroundColorForRowWithNotGradedQuestion = selectedColor;
  }

  onBackgroundColorForGradedQuestionSelected(selectedColor) {
    this.backgroundColorForRowWithGradedQuestion = selectedColor;
  }  
}
