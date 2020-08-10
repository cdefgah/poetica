import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AbstractInteractiveComponentModel } from '../core/base/AbstractInteractiveComponentModel';
import { CharsetEncodingEntity } from './support/CharsetEncodingEntity';
import { TeamDataModel } from '../../data-model/TeamDataModel';

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
    const notGradedAnswerPresenceAction = () => {
      // сперва делаем запрос на наличие ответов без оценок
      const answerWithoutGradesCheckUri = '/answers/not-graded-presence';

      this.http.get(answerWithoutGradesCheckUri).subscribe((teamIdInfo: any) => {
        const foundTeamIdString: string = teamIdInfo ? teamIdInfo.toString() : '';

        if (!(foundTeamIdString && foundTeamIdString.length > 0)) {
          // если нет команд с не оцененными ответами
          // подтверждаем действие экспорта отчёта и выполняем его
          const confirmationMessage = `Выгрузить таблицу результатов в указанном формате и кодировке?`;

          this.confirmationDialog(confirmationMessage, () => {
            // если диалог был принят (accepted)
            // выгружаем отчёт
            const actionUri = `/reports/results-table/${this.selectedResultsTableFormatAlias}/${this.selectedEncodingSystemName}`;
            window.location.href = actionUri;
          });

        } else {
          // если найдена команда, для которой есть ответы без оценок.
          const teamInfoUri = `/teams/${foundTeamIdString}`;
          this.http.get(teamInfoUri).subscribe(
            (foundTeam: TeamDataModel) => {
              this.displayMessage(`Найдена как минимум одна команда, у которой не все ответы получили оценку.
                 Команда называется '${foundTeam.title}', её номер: ${foundTeam.number}.
                  На странице ответов выберите эту команду и укажите режим отображения 'Все -> Ответы без оценки',
                   чтобы увидеть ответы этой команды, у которых нет оценки.`);
              return;
            },
            (error) => this.reportServerError(error)
          );
        }
      },
        (error) => this.reportServerError(error)
      );
    };

    this.checkAnswersPresentAndRunAction(notGradedAnswerPresenceAction);
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
