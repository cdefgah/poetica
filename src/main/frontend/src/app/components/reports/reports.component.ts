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

  exportTeamsWithNotGradedAnswers() {
    const notGradedAnswerPresenceAction = () => {
      // сперва делаем запрос на наличие ответов без оценок
      const answerWithoutGradesCheckUri = '/answers/not-graded-presence';

      this.http.get(answerWithoutGradesCheckUri).subscribe((teamIdInfo: any) => {
        const foundTeamIdString: string = teamIdInfo ? teamIdInfo.toString() : '';

        if (foundTeamIdString && foundTeamIdString.length > 0) {
          // если есть хотя-бы одна команда с неоцененными ответами
          // выгружаем отчёт, после подтверждения действия

          // если нет команд с не оцененными ответами
          // подтверждаем действие экспорта отчёта и выполняем его
          const confirmationMessage = `Выгрузить перечень команд, у которых не все ответы получили оценку? Отчёт будет выгружен в указанной вверху кодировке.`;

          this.confirmationDialog(confirmationMessage, () => {
            // если диалог был принят (accepted)
            // выгружаем отчёт

            // TODO такой подход к выгрузке, мягко говоря, неправильный.
            // Если пользователь обновит страницу после выгрузки отчёта, он опять его выгрузит,
            // так как location.href будет показывать на url сервиса генерации отчётов.

            const actionUri = `/reports/teams-with-not-graded-answers/${this.selectedEncodingSystemName}`;
            window.location.href = actionUri;
          });

        } else {
          this.displayMessage('Все зарегистрированные в системе ответы получили оценку.');
        }
      },
        (error) => this.reportServerError(error)
      );
    };

    this.checkAnswersPresentAndRunAction(notGradedAnswerPresenceAction);
  }

  private checkAllAnswersAreGradedAndRunAction(action: any) {
    // сперва делаем запрос на наличие ответов без оценок
    const answerWithoutGradesCheckUri = '/answers/not-graded-presence';

    this.http.get(answerWithoutGradesCheckUri).subscribe((teamIdInfo: any) => {
      const foundTeamIdString: string = teamIdInfo ? teamIdInfo.toString() : '';

      if (!(foundTeamIdString && foundTeamIdString.length > 0)) {
        // если нет команд с не оцененными ответами
        action();

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
  }

  exportResultsTable() {
    const exportResultsTableAction = () => {
      // подтверждаем действие экспорта отчёта и выполняем его
      const confirmationMessage = `Выгрузить таблицу результатов в указанном формате и кодировке?`;

      this.confirmationDialog(confirmationMessage, () => {
        // если диалог был принят (accepted)
        // выгружаем отчёт
        const actionUri = `/reports/results-table/${this.selectedResultsTableFormatAlias}/${this.selectedEncodingSystemName}`;
        window.location.href = actionUri;
      });
    };

    // при наличии ответов - проверяем, чтобы не было ответов без оценок
    const notGradedAnswerPresenceAction = () => this.checkAllAnswersAreGradedAndRunAction(exportResultsTableAction);

    // после проверки на наличие зачётных заданий, проверяем наличие ответов
    const checkAnswersPresenceAndRun = () => this.checkAnswersPresentAndRunAction(notGradedAnswerPresenceAction);

    // сперва проверяем, чтобы был хоть один зачётный вопрос (задание)
    this.checkGradedQuestionsPresentAndRunAction(checkAnswersPresenceAndRun);
  }

  checkGradedQuestionsPresentAndRunAction(action: any) {
    const url = '/questions/graded-present';
    this.http.get(url).subscribe(
      (gradedQuestionsPresentFlag: boolean) => {
        if (gradedQuestionsPresentFlag) {
          action();
        } else {
          this.displayMessage('Все задания в системе отмечены как внезачётные. В таком случае нет никакого смысла строить этот отчёт. Очки команд и их рейтинги будут нулевыми.');
        }
      },
      (error) => this.reportServerError(error)
    );
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

  exportCollectionReport() {
    const confirmationMessage = `Выгрузить собрание сочинений в указанной кодировке?`;

    const exportCollectionReportAction = () => {
      // если диалог был принят (accepted)
      // выгружаем отчёт
      const url = `/reports/collection/${this.selectedEncodingSystemName}`;
      window.location.href = url;
    };

    // при наличии ответов - проверяем, чтобы не было ответов без оценок
    const notGradedAnswerPresenceAction = () => this.checkAllAnswersAreGradedAndRunAction(exportCollectionReportAction);

    // сперва проверяем наличие ответов
    this.checkAnswersPresentAndRunAction(notGradedAnswerPresenceAction);
  }
}
