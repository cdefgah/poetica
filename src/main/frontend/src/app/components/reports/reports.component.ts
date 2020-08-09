import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AbstractInteractiveComponentModel } from '../core/base/AbstractInteractiveComponentModel';
import { CharsetEncodingEntity } from './support/CharsetEncodingEntity';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent extends AbstractInteractiveComponentModel
  implements OnInit {
  encodingSystemNames: string[] = [];
  encodingHumanReadableTitles: string[] = [];

  selectedEncodingSystemName: string;

  allResultsTableFormatTitles: string[] = [
    'Длинный',
    'Промежуточный',
    'Короткий'
  ];

  allResultsTableFormatAliases: string[] = [
    'Full',
    'Medium',
    'Short'
  ];

  selectedResultsTableFormatAlias: string = this.allResultsTableFormatAliases[0];

  constructor(private http: HttpClient, private dialog: MatDialog) {
    super();
    this.loadAllReportEncodingVariants();
  }

  ngOnInit() { }

  protected getMessageDialogReference(): MatDialog {
    return this.dialog;
  }

  loadAllReportEncodingVariants() {
    const url = '/configuration/supported-report-encodings';
    this.http.get(url).subscribe(
      (data: CharsetEncodingEntity[]) => {
        data.forEach((element) => {
          this.encodingSystemNames.push(element.systemName);
          this.encodingHumanReadableTitles.push(element.humanReadableTitle);
        });

        this.selectedEncodingSystemName = this.encodingSystemNames[0];
      },
      (error) => this.reportServerError(error)
    );
  }

  exportResultsTable() {
    const confirmationMessage = `Выгрузить таблицу результатов в указанном формате и кодировке?`;

    const dialogAcceptedAction = () => {
      // если диалог был принят (accepted)
      // выгружаем отчёт
      const url = `/reports/results-table/${this.selectedResultsTableFormatAlias}/${this.selectedEncodingSystemName}`;
      window.location.href = url;
    };

    this.checkAnswersPresentAndRunAction(() => this.confirmationDialog(confirmationMessage, dialogAcceptedAction));
  }

  checkAnswersPresentAndRunAction(action: any) {
    const url = '/answers/present';
    this.http.get(url).subscribe(
      (answersPresentFlag: boolean) => {
        if (answersPresentFlag) {
          action();
        } else {
          this.displayMessage('В системе пока нет ни одного загруженного ответа, загрузите их, прежде чем строить отчёт.');
        }
      },
      (error) => this.reportServerError(error)
    );
  }

  exportQuestionsWithoutAnswers() {
    const confirmationMessage = `Выгрузить задания без ответов в указанной кодировке?`;

    const dialogAcceptedAction = () => {
      // если диалог был принят (accepted)
      // выгружаем отчёт
      const url = `/reports/questions-without-answers/${this.selectedEncodingSystemName}`;
      window.location.href = url;
    };

    this.checkQuestionsPresentAndRunAction(() => this.confirmationDialog(confirmationMessage, dialogAcceptedAction));
  }

  exportQuestionsWithAnswers() {
    const confirmationMessage = `Выгрузить задания с ответами в указанной кодировке?`;

    const dialogAcceptedAction = () => {
      // если диалог был принят (accepted)
      // выгружаем отчёт
      const url = `/reports/questions-with-answers/${this.selectedEncodingSystemName}`;
      window.location.href = url;
    };

    this.checkQuestionsPresentAndRunAction(() => this.confirmationDialog(confirmationMessage, dialogAcceptedAction));
  }

  checkQuestionsPresentAndRunAction(action: any) {
    const url = '/questions/total-amount';
    this.http.get(url).subscribe(
      (totalAmount: number) => {
        if (totalAmount === 0) {
          this.displayMessage('В системе пока нет загруженных заданий (вопросов). Загрузите их, прежде чем строить отчёт.');
        } else {
          action();
        }
      },
      (error) => this.reportServerError(error)
    );
  }
}
