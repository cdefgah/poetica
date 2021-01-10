/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { AbstractInteractiveComponentModel } from 'src/app/components/core/base/AbstractInteractiveComponentModel';
import {
  MatDialog,
  MatDialogConfig,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AnswerDataModel } from 'src/app/data-model/AnswerDataModel';
import { EmailDataModel } from 'src/app/data-model/EmailDataModel';
import { TeamDataModel } from 'src/app/data-model/TeamDataModel';
import { QuestionDataModel } from 'src/app/data-model/QuestionDataModel';
import { AnswerDetailsDialogResult } from './AnswerDetailsDialogResult';

@Component({
  selector: 'app-answer-details',
  templateUrl: './answer-details.component.html',
  styleUrls: ['./answer-details.component.css'],
})
export class AnswerDetailsComponent extends AbstractInteractiveComponentModel
  implements OnInit, AfterViewInit {
  private static readonly KEY_DIALOG_ID = 'id';

  // инициализация пустыми объектами, чтобы связанные со свойствами этих объектов компоненты отрисовались корректно
  answer: AnswerDataModel = AnswerDataModel.emptyAnswer;
  email: EmailDataModel = EmailDataModel.emptyEmail;
  team: TeamDataModel = TeamDataModel.emptyTeam;
  question: QuestionDataModel = QuestionDataModel.emptyQuestion;

  questionNumberToDisplay: string;

  static getDialogConfigWithData(row: any): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '75%';

    dialogConfig.data = new Map<string, any>();
    dialogConfig.data[AnswerDetailsComponent.KEY_DIALOG_ID] = row[AnswerDetailsComponent.KEY_DIALOG_ID];

    return dialogConfig;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private httpClient: HttpClient,
    public dialog: MatDialogRef<AnswerDetailsComponent>,
    public otherDialog: MatDialog
  ) {
    super();

    const answerId = dialogData[AnswerDetailsComponent.KEY_DIALOG_ID];

    const componentReference = this;

    // получаем объект answer
    const answerDetailsUrl = `/answers/${answerId}`;
    this.httpClient.get(answerDetailsUrl).subscribe(
      (answerDetailsData: Map<string, any>) => {
        // получили, строим объект
        this.answer = AnswerDataModel.createAnswerFromMap(answerDetailsData);

        // получаем объект email
        const emailRequestUrl = `/emails/${this.answer.emailId}`;
        this.httpClient.get(emailRequestUrl).subscribe(
          (emailDetailsData: Map<string, any>) => {
            // получили, строим объект
            this.email = EmailDataModel.createEmailFromMap(emailDetailsData);

            // получаем объект question
            const questionRequestUrl = `/questions/${this.answer.questionId}`;
            this.httpClient.get(questionRequestUrl).subscribe(
              (questionDetailData: Map<string, any>) => {
                // получили, строим объект
                this.question = QuestionDataModel.createQuestionFromMap(
                  questionDetailData
                );

                // формируем отображаемый номер вопроса
                const answersQuestionNumberString = componentReference.answer.questionNumber.toString();
                if (componentReference.question.externalNumber === answersQuestionNumberString) {
                  componentReference.questionNumberToDisplay = componentReference.question.externalNumber;
                } else {
                  componentReference.questionNumberToDisplay = `${componentReference.question.externalNumber}/${answersQuestionNumberString}`;
                }

                // получаем объект team
                const teamRequestUrl = `/teams/${this.answer.teamId}`;
                this.httpClient.get(teamRequestUrl).subscribe(
                  (teamDetailsData: Map<string, any>) => {
                    // получили, строим объект
                    this.team = TeamDataModel.createTeamFromMap(
                      teamDetailsData
                    );
                  },
                  (error) => this.reportServerError(error)
                );
              },
              (error) => this.reportServerError(error)
            );
          },
          (error) => this.reportServerError(error)
        );
      },
      (error) => this.reportServerError(error)
    );
  }

  ngOnInit(): void { }

  ngAfterViewInit() {
  }

  get dialogTitle(): string {
    return `Ответ [ ${this.answer.answerGrade2Display} ]`;
  }

  protected getMessageDialogReference(): MatDialog {
    return this.otherDialog;
  }

  acceptAnswer() {
    this.confirmationDialog('Принять ответ?', () => {
      const requestUrl = '/answers/accept';
      const payload = new HttpParams().set('answerId', this.answer.id.toString()
      );

      this.httpClient.put(requestUrl, payload).subscribe(
        () => {
          const acceptedAnswerGrade = 'Accepted';
          const dialogResult: AnswerDetailsDialogResult = new AnswerDetailsDialogResult(this.answer.grade, acceptedAnswerGrade);
          this.dialog.close(dialogResult);
        },
        (error) => this.reportServerError(error)
      );
    });
  }

  declineAnswer() {
    this.confirmationDialog('Отклонить ответ?', () => {
      const requestUrl = '/answers/decline';
      const payload = new HttpParams().set('answerId', this.answer.id.toString());

      this.httpClient.put(requestUrl, payload).subscribe(
        () => {
          const NotAcceptedAnswerGrade = 'NotAccepted';
          const dialogResult: AnswerDetailsDialogResult = new AnswerDetailsDialogResult(this.answer.grade, NotAcceptedAnswerGrade);
          this.dialog.close(dialogResult);
        },
        (error) => this.reportServerError(error)
      );
    });
  }

  justCloseDialog() {
    this.dialog.close(AnswerDetailsDialogResult.emptyResult);
  }
}
