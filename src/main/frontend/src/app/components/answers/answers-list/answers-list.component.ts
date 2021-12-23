/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { MatRadioChange, MatDialog, MatSelectChange, MatSort, MatTableDataSource } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { AnswersListImporterComponent } from '../answers-list-importer/answers-list-importer.component';
import { EmailsCountDigest } from './support/EmailsCountDigest';
import { AnswerDetailsComponent } from '../answer-details/answer-details.component';
import { EmailDetailsComponent } from '../email-details/email-details.component';
import { AnswerDetailsDialogResult } from '../answer-details/AnswerDetailsDialogResult';
import { AnswersImporterDialogResult } from '../answers-list-importer/AnswersImporterDialogResult';
import { AbstractInteractiveComponentModel } from '../../core/base/AbstractInteractiveComponentModel';
import { AnswerDataModel } from '../../../data-model/AnswerDataModel';
import { EmailDataModel } from '../../../data-model/EmailDataModel';
import { TeamDataModel } from '../../../data-model/TeamDataModel';
import { PoeticaLogger } from '../../../utils/PoeticaLogger';

@Component({
  selector: 'app-answers-list',
  templateUrl: './answers-list.component.html',
  styleUrls: ['./answers-list.component.css'],
})
export class AnswersListComponent extends AbstractInteractiveComponentModel
  implements OnInit, AfterViewInit {

  //#region ComponentFields
  selectedTeamId: number;
  allTeamIds: number[];
  teamTitleAndNumber: string[];

  allRoundAliases: string[] = ['0', '1', '2'];
  allRoundTitles: string[] = [
    'Все',
    'Предварительный тур',
    'Окончательный тур',
  ];

  @ViewChild('allAnswersTableSort') public allAnswersTableSort: MatSort;
  @ViewChild('answersWithoutGradesSort') public answersWithoutGradesSort: MatSort;
  @ViewChild('loadedEmailsTableSort') public loadedEmailsTableSort: MatSort;

  selectedRoundAlias: string = this.allRoundAliases[0];

  answersDataSource: MatTableDataSource<AnswerDataModel> = new MatTableDataSource([]);
  answersWithoutGradesDataSource: MatTableDataSource<AnswerDataModel> = new MatTableDataSource([]);
  emailsDataSource: MatTableDataSource<EmailDataModel> = new MatTableDataSource([]);

  private acceptedAnswerBackgroundColor: string;
  private notAcceptedAnswerBackgroundColor: string;
  private notGradedAnswerBackgroundColor: string;

  /**
   * Инициализируем пустым дайджестом, чтобы не сломались компоненты, привязанные к этому свойству.
   * TODO - перенести потом инициализацию в ngOnInit() метод, чтоб не было нужды в инициализации пустыми значениями.
   */
  emailsCountDigest: EmailsCountDigest = EmailsCountDigest.emptyDigest;

  displayedAnswerColumns: string[] = [
    'questionNumber',
    'emailSentOn',
    'body',
    'roundNumber',
    'comment',
  ];

  displayedEmailColumns: string[] = [
    'sentOn',
    'importedOn',
    'questionNumbersSequence',
  ];
  //#endregion

  displayingOnlyTeamsWithNotGradedAnswers = false;
  notGradedAnswersArePresent = false;

  //#region ConstructorsAndInits
  constructor(private cdRef: ChangeDetectorRef, private http: HttpClient, private dialog: MatDialog) {
    super();
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.answersDataSource.sort = this.allAnswersTableSort;
    this.answersWithoutGradesDataSource.sort = this.answersWithoutGradesSort;
    this.emailsDataSource.sort = this.loadedEmailsTableSort;

    this.cdRef.detectChanges();
    PoeticaLogger.logObjectState(this.answersDataSource.sort, 'this.answersDataSource.sort');

    this.checkNotGradedAnswersPresence();

    this.loadTeamsList(this, -1, false, this.populateTeamSelectionFieldAndLoadAnswersWithEmails);
    this.loadTableColors();
  }
  //#endregion

  loadTableColors() {
    // загружаем цвета фона для строк таблицы ответов
    // цвета фона различаются для зачтённых, незачтённых ответов и для ответов без оценки.

    const url = '/configuration/colors-for-answers';
    this.http.get(url).subscribe(
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

  //#region EventHandlers
  actualRoundChanged(event: MatRadioChange) {
    this.selectedRoundAlias = event.value;

    this.loadTeamsList(this,
      this.selectedTeamId, this.displayingOnlyTeamsWithNotGradedAnswers,
      this.populateTeamSelectionFieldAndLoadAnswersWithEmails);
  }

  actualTeamChanged(event: MatSelectChange) {
    this.selectedTeamId = event.value;

    this.loadTeamsList(this,
      this.selectedTeamId, this.displayingOnlyTeamsWithNotGradedAnswers,
      this.populateTeamSelectionFieldAndLoadAnswersWithEmails);
  }

  onAnswerRowClicked(selectedRow: any) {
    const dialogConfig = AnswerDetailsComponent.getDialogConfigWithData(
      selectedRow
    );
    const dialogRef = this.dialog.open(AnswerDetailsComponent, dialogConfig);

    const componentReference = this;
    dialogRef.afterClosed().subscribe((result) => {
      const dialogResult: AnswerDetailsDialogResult = result;
      if (dialogResult.noChangesWereMade) {
        // если никаких изменений не было, просто выходим
        return;
      }

      // проставляем оценку в клиентском объекте
      // с сервера ничего не загружаем, там данные уже поменялись
      // при закрытии диалога (в однопользовательском режиме мы можем себе это позволить)
      selectedRow.grade = dialogResult.gradeOnDialogClose;

      // если была поставлена оценка ответу, у которого ранее не было оценки
      if (dialogResult.gradeSetToNonGradedAnswer) {
        // удаляем ответ из списка ответов без оценки
        componentReference.removeAnswerFromNotGradedAnswersList(componentReference, selectedRow.id);

        // если включён режим отображения только команд с оценками без ответов
        if (componentReference.displayingOnlyTeamsWithNotGradedAnswers) {
          // проверяем, остаются-ли у команды ответы без оценок
          // мы делаем запрос с сервера, так как локально в списках могут быть ответы только для какого-то тура
          // и пустой список с ответами без оценок за какой-то тур совсем не означает, что ответов без оценок для этой команды больше нет
          const url = `/answers/not-graded-presence/${selectedRow.teamId}`;
          componentReference.http.get(url).subscribe(
            (data: any) => {
              const resultString: string = data ? data.toString() : '';
              if (resultString.length === 0) {
                // у команды больше нет ответов без оценок
                componentReference.processAllTeamAnswersBecomeGraded(componentReference, selectedRow.teamId);
              }
            },
            (error) => componentReference.reportServerError(error)
          );
        } else {
          // если включён режим отображения всех команд
          if (componentReference.notGradedAnswersArePresent) {
            // плюс до оценки ответа был выставлен флаг о наличии ответов без оценки
            // обновляем флаг о наличии ответов без оценки
            componentReference.checkNotGradedAnswersPresence();
          }
        }
      }
    });
  }

  private processAllTeamAnswersBecomeGraded(componentReference: AnswersListComponent, teamId: number): void {
    // проверяем, сколько команд есть в поле выбора команды
    if (componentReference.allTeamIds.length === 1) {
      // если в списке команд только текущая команда
      // включаем отображение всех команд
      componentReference.displayingOnlyTeamsWithNotGradedAnswers = false;
      componentReference.notGradedAnswersArePresent = false;

    } else {
      // если в списке команд кроме текущей есть и другие команды
      const index = componentReference.allTeamIds.indexOf(teamId);

      // удаляем найденный элемент, не надо проверять index на -1, ибо элемент заведомо существует
      componentReference.allTeamIds.splice(index, 1); // удаляем из списка идентификаторов
      componentReference.teamTitleAndNumber.splice(index, 1); // удаляем из отображаемого списка

      componentReference.selectedTeamId = componentReference.allTeamIds[0]; // первую команду из списка ставим как выбранную
    }

    // загружаем команды и ответы для команды, чей id указан в параметрах
    componentReference.loadTeamsList(componentReference,
      componentReference.selectedTeamId, componentReference.displayingOnlyTeamsWithNotGradedAnswers,
      componentReference.populateTeamSelectionFieldAndLoadAnswersWithEmails);
  }


  private removeAnswerFromNotGradedAnswersList(componentReference: AnswersListComponent, answerId: number) {
    const index = componentReference.answersWithoutGradesDataSource.data.findIndex(oneAnswer => oneAnswer.id === answerId);

    // удаляем найденный элемент, не надо проверять index на -1, ибо элемент заведомо существует
    componentReference.answersWithoutGradesDataSource.data.splice(index, 1);

    // обновляем источник данных
    componentReference.answersWithoutGradesDataSource._updateChangeSubscription();
  }

  onEmailRowClicked(selectedRow: any) {
    const dialogConfig = EmailDetailsComponent.getDialogConfigWithData(
      selectedRow
    );
    const dialogRef = this.dialog.open(EmailDetailsComponent, dialogConfig);

    const componentReference = this;
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // если письмо было удалено (+ все ответы из него)
        if (componentReference.displayingOnlyTeamsWithNotGradedAnswers) {
          // если включен режим отображения только команд с ответами без оценок

          // проверяем наличие ответов без оценок для текущей команды
          const url = `/answers/not-graded-presence/${selectedRow.teamId}`;
          componentReference.http.get(url).subscribe(
            (data: any) => {
              const resultString: string = data ? data.toString() : '';
              if (resultString.length === 0) {
                // у команды больше нет ответов без оценок
                componentReference.processAllTeamAnswersBecomeGraded(componentReference, selectedRow.teamId);
              } else {
                // у команды ещё есть ответы без оценок, загружаем заново ответы для команды
                componentReference.loadAnswersAndEmailsForTeam(componentReference,
                  componentReference.selectedTeamId, componentReference.selectedRoundAlias);
              }
            },
            (error) => componentReference.reportServerError(error)
          );

        } else {
          // если включён режим отображения всех команд
          // просто загружаем ответы для текущей команды ещё раз
          componentReference.loadAnswersAndEmailsForTeam(componentReference,
            componentReference.selectedTeamId, componentReference.selectedRoundAlias);
        }
      }
    });
  }
  //#endregion

  //#region ImportAnswers
  public checkPrerequisitesAndDoImportAnswers(): void {
    const questionsMaxNumberEndPointUrl = '/questions/max-number';
    this.http.get(questionsMaxNumberEndPointUrl).subscribe(
      (maxNumberOfRegisteredQuestion: number) => {
        if (maxNumberOfRegisteredQuestion > 0) {
          // вопросы в базе представлены, проверяем наличие команд
          const teamsTotalEndpointUrl = '/teams/total-number';
          this.http.get(teamsTotalEndpointUrl).subscribe(
            (numberOfTeamsPresent: number) => {
              if (numberOfTeamsPresent > 0) {
                this.importAnswers();
              } else {
                this.displayMessage(
                  'Не найдено зарегистрированных команд. Пожалуйста зарегистрируйте команды в системе, прежде чем импортировать ответы.'
                );
              }
            },
            (error) => {
              this.reportServerError(
                error,
                'Не удалось получить информацию из базы данных о количестве команд.'
              );
            }
          );
        } else {
          this.displayMessage(
            'Не удалось найти зарегистрированных заданий. Пожалуйста импортируйте в систему задания прежде чем импортировать ответы.'
          );
        }
      },
      (error) => {
        this.reportServerError(
          error,
          'Не удалось получить информацию из базы данных о количестве заданий.'
        );
      }
    );
  }

  private importAnswers() {
    const importDialogConfig = AnswersListImporterComponent.getDialogConfigWithData();
    const dialogRef = this.dialog.open(
      AnswersListImporterComponent,
      importDialogConfig
    );
    const componentReference = this;
    dialogRef.afterClosed().subscribe((result: AnswersImporterDialogResult) => {
      if (result.dialogAccepted) {
        // выставляем команду и раунд, согласно информации из диалога импорта
        componentReference.selectedTeamId = result.teamId;
        componentReference.selectedRoundAlias = result.roundAlias;

        // если до импорта у нас не был выставлен флаг о том,
        // что у нас есть ответы без оценок
        if (!componentReference.notGradedAnswersArePresent) {
          // то выставляем его
          componentReference.notGradedAnswersArePresent = true;
        }

        // загружаем ответы команды
        componentReference.loadAnswersAndEmailsForTeam(componentReference,
          componentReference.selectedTeamId, componentReference.selectedRoundAlias);
      }
    });
  }
  //#endregion

  //#region ServerDataLoaders
  loadTeamsList(componentReference: AnswersListComponent, previouslySelectedTeamId: number, onlyWithNotGradedAnswers: boolean,
                onSuccess: (componentReference: AnswersListComponent, 
                            loadedTeams: TeamDataModel[], previouslySelectedTeamId: number) => void): void {

    const url = onlyWithNotGradedAnswers ? '/teams/only-with-not-graded-answers' : '/teams/all';

    componentReference.http.get(url).subscribe(
      (unsortedTeamsList: TeamDataModel[]) => {
        const sortedTeamsList: TeamDataModel[] = unsortedTeamsList.sort((team1, team2) => {
          if (team1.title > team2.title) {
            return 1;
          }

          if (team1.title < team2.title) {
            return -1;
          }

          return 0;
        });

        onSuccess(componentReference, sortedTeamsList, previouslySelectedTeamId);
      },
      (error) => this.reportServerError(error)
    );
  }

  populateTeamSelectionFieldAndLoadAnswersWithEmails(
    componentReference: AnswersListComponent, loadedTeams: TeamDataModel[],
    previouslySelectedTeamId: number): void {

    const allTeamIdentifiers: number[] = [];
    const teamTitlesAndNumbers: string[] = [];

    loadedTeams.forEach((oneTeam) => {
      allTeamIdentifiers.push(oneTeam.id);
      teamTitlesAndNumbers.push(`${oneTeam.title} (${oneTeam.number})`);
    });

    componentReference.allTeamIds = allTeamIdentifiers;
    componentReference.teamTitleAndNumber = teamTitlesAndNumbers;

    let indexOfPreviouslySelectedTeamId = -1;
    if (previouslySelectedTeamId >= 0) {
      indexOfPreviouslySelectedTeamId = componentReference.allTeamIds.indexOf(previouslySelectedTeamId);
    }

    // если id ранее выбранной команды был в списке, выставляем его, иначе выставляем id первой команды из списка
    componentReference.selectedTeamId = indexOfPreviouslySelectedTeamId >= 0 ?
      componentReference.allTeamIds[indexOfPreviouslySelectedTeamId] : componentReference.allTeamIds[0];

    // загружаем ответы для команды
    componentReference.loadAnswersAndEmailsForTeam(componentReference,
      componentReference.selectedTeamId, componentReference.selectedRoundAlias);
  }
  //#endregion

  loadAnswersAndEmailsForTeam(componentReference: AnswersListComponent, teamId: number, roundAlias: string): void {
    // Если команд нет в системе, просто выходим, нечего загружать
    // письма (и ответы) без команд не импортируются
    // а удалить команду, при наличии ответов нельзя
    if (!teamId) {
      return;
    }

    const url = `/answers/${teamId}/${roundAlias}`;

    componentReference.http.get(url).subscribe(
      (loadedAnswers: AnswerDataModel[]) => {
        // разносим загруженные ответы по разным спискам (все,  без оценок)
        componentReference.separateAndSortLoadedAnswers(loadedAnswers, componentReference);

        // загружаем письма для команды
        componentReference.loadEmailsForTeam(componentReference, teamId, roundAlias);
      },
      (error) => componentReference.reportServerError(error)
    );
  }

  private separateAndSortLoadedAnswers(loadedAnswers: AnswerDataModel[], componentReference: AnswersListComponent) {
    componentReference.answersDataSource.data.length = 0;
    componentReference.answersWithoutGradesDataSource.data.length = 0;

    loadedAnswers.sort(compareAnswers);

    loadedAnswers.forEach((oneLoadedAnswer) => {
      componentReference.answersDataSource.data.push(oneLoadedAnswer);
      if (oneLoadedAnswer.grade === AnswerDataModel.GradeNone) {
        componentReference.answersWithoutGradesDataSource.data.push(oneLoadedAnswer);
      }
    });

    componentReference.answersDataSource._updateChangeSubscription();
    componentReference.answersWithoutGradesDataSource._updateChangeSubscription();

    // --- локальные функции ---
    function compareAnswers(oneAnswer: AnswerDataModel, anotherAnswer: AnswerDataModel) {
      if (oneAnswer.questionNumber < anotherAnswer.questionNumber) {
        return -1;
      } else if (oneAnswer.questionNumber > anotherAnswer.questionNumber) {
        return 1;
      } else {
        return compareEmailSentOnInTheAnswers(oneAnswer, anotherAnswer);
      }
    }

    function compareEmailSentOnInTheAnswers(oneAnswer: AnswerDataModel, anotherAnswer: AnswerDataModel) {
      if (oneAnswer.emailSentOn < anotherAnswer.emailSentOn) {
        return -1;
      } else if (oneAnswer.emailSentOn > anotherAnswer.emailSentOn) {
        return 1;
      } else {
        return 0;
      }
    }
    // ---------------------------------------------
  }

  loadEmailsForTeam(componentReference: AnswersListComponent, teamId: number, roundAlias: string) {
    // Если команд нет в системе, просто выходим, нечего загружать
    // письма (и ответы) без команд не импортируются
    // а удалить команду, при наличии ответов нельзя
    if (!teamId) {
      return;
    }

    const emailsUrl = `/emails/${teamId}/${roundAlias}`;

    componentReference.http.get(emailsUrl).subscribe(
      (loadedEmailsList: EmailDataModel[]) => {
        componentReference.emailsDataSource.data = loadedEmailsList;

        const digestUrl = `/emails/digest/${teamId}`;
        componentReference.http.get(digestUrl).subscribe(
          (emailsCountDigest: EmailsCountDigest) => {
            componentReference.emailsCountDigest = emailsCountDigest;
          },
          (error) => componentReference.reportServerError(error)
        );
      },
      (error) => componentReference.reportServerError(error)
    );
  }

  protected getMessageDialogReference(): MatDialog {
    return this.dialog;
  }


  //#region utility methods
  private checkNotGradedAnswersPresence() {
    const answerWithoutGradesCheckUri = '/answers/not-graded-presence';
    this.http.get(answerWithoutGradesCheckUri).subscribe((teamIdInfo: any) => {
      const foundTeamIdString: string = teamIdInfo ? teamIdInfo.toString() : '';

      if (!(foundTeamIdString && foundTeamIdString.length > 0)) {
        // если все ответы имеют оценку
        this.notGradedAnswersArePresent = false;
      } else {
        // если есть ответы без оценок.
        this.notGradedAnswersArePresent = true;
      }
    },
      (error) => this.reportServerError(error)
    );
  }

  turnOnDisplayingOnlyTeamsWithNonGradedAnswers() {
    // включает режим отображения команд у которых есть ответы без оценок
    if (this.displayingOnlyTeamsWithNotGradedAnswers) {
      // если этот режим уже включён, просто выходим
      return;
    }

    this.displayingOnlyTeamsWithNotGradedAnswers = true;
    this.selectedRoundAlias = this.allRoundAliases[0];

    this.loadTeamsList(this,
      this.selectedTeamId, this.displayingOnlyTeamsWithNotGradedAnswers,
      this.populateTeamSelectionFieldAndLoadAnswersWithEmails);
  }

  turnOffDisplayingOnlyTeamsWithNonGradedAnswers() {
    // выключает режим отображения команд у которых есть ответы без оценок
    // и показывает все команды

    if (!this.displayingOnlyTeamsWithNotGradedAnswers) {
      // если этот режим уже выключён, просто выходим
      return;
    }

    this.displayingOnlyTeamsWithNotGradedAnswers = false;
    this.selectedRoundAlias = this.allRoundAliases[0];

    this.loadTeamsList(this,
      this.selectedTeamId, this.displayingOnlyTeamsWithNotGradedAnswers,
      this.populateTeamSelectionFieldAndLoadAnswersWithEmails);
  }

  //#endregion

  getRowBackgroundColor(row): string {
    console.log('============ getRowBackgroundColor::START =================');
    switch(row.Grade) {
      case 'Accepted':
        console.log('ACCEPTED COLOR');
        return this.acceptedAnswerBackgroundColor;
         
      case 'NotAccepted':
        console.log('NOT-ACCEPTED COLOR');
        return this.notAcceptedAnswerBackgroundColor;
      default:
        console.log('NOT GRADED COLOR');
        return this.notGradedAnswerBackgroundColor;
    }
  }
}
