/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatRadioChange, MatDialog, MatSelectChange, MatSort, MatTableDataSource } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { AnswerDataModel } from 'src/app/data-model/AnswerDataModel';
import { TeamDataModel } from 'src/app/data-model/TeamDataModel';
import { EmailDataModel } from 'src/app/data-model/EmailDataModel';
import { AnswersListImporterComponent } from '../answers-list-importer/answers-list-importer.component';
import { AbstractInteractiveComponentModel } from 'src/app/components/core/base/AbstractInteractiveComponentModel';
import { EmailsCountDigest } from './support/EmailsCountDigest';
import { AnswerDetailsComponent } from '../answer-details/answer-details.component';
import { debugString, debugObject } from 'src/app/utils/Config';
import { EmailDetailsComponent } from '../email-details/email-details.component';
import { AnswerDetailsDialogResult } from '../answer-details/AnswerDetailsDialogResult';
import { AnswersImporterDialogResult } from '../answers-list-importer/AnswersImporterDialogResult';

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

  // если у нас много таблиц с сортируемыми колонками, то надо хитрО извернуться
  // https://stackoverflow.com/questions/48001006/angular-material-distinct-mat-sort-on-multiple-tables/49056060

  @ViewChild('allAnswersSort') public allAnswersSortHandler: MatSort;
  @ViewChild('answersWithoutGradesSort') public answersWithoutGradesSortHandler: MatSort;
  @ViewChild('loadedEmailsSort') public loadedEmailsSortHandler: MatSort;

  selectedRoundAlias: string = this.allRoundAliases[0];

  answersDataSource: MatTableDataSource<AnswerDataModel> = new MatTableDataSource([]);
  answersWithoutGradesDataSource: MatTableDataSource<AnswerDataModel> = new MatTableDataSource([]);
  emailsDataSource: MatTableDataSource<EmailDataModel> = new MatTableDataSource([]);

  /**
   * Инициализируем пустым дайджестом, чтобы не сломались компоненты, привязанные к этому свойству.
   * TODO - перенести потом инициализацию в ngOnInit() метод, чтоб не было нужды в инициализации пустыми значениями.
   */
  emailsCountDigest: EmailsCountDigest = EmailsCountDigest.emptyDigest;

  displayedAnswerColumns: string[] = [
    'number',
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
  constructor(private http: HttpClient, private dialog: MatDialog) {
    super();
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.answersDataSource.sort = this.allAnswersSortHandler;
    this.answersWithoutGradesDataSource.sort = this.answersWithoutGradesSortHandler;
    this.emailsDataSource.sort = this.loadedEmailsSortHandler;

    this.checkNotGradedAnswersPresence();

    this.loadTeamsList(this, -1, false, this.populateTeamSelectionFieldAndLoadAnswersWithEmails);
  }
  //#endregion

  //#region EventHandlers
  actualRoundChanged(event: MatRadioChange) {
    this.selectedRoundAlias = event.value;

    this.loadTeamsList(this,
      this.selectedTeamId, this.displayingOnlyTeamsWithNotGradedAnswers,
      this.populateTeamSelectionFieldAndLoadAnswersWithEmails);
  }

  actualTeamChanged(event: MatSelectChange) {
    debugString(`this.selectedTeamId BEFORE ASSIGNMENT: ${this.selectedTeamId}`);
    this.selectedTeamId = event.value;
    debugString(`this.selectedTeamId AFTER ASSIGNMENT: ${this.selectedTeamId}`);

    this.loadTeamsList(this,
      this.selectedTeamId, this.displayingOnlyTeamsWithNotGradedAnswers,
      this.populateTeamSelectionFieldAndLoadAnswersWithEmails);
  }

  onAnswerRowClicked(selectedRow: any) {
    debugString('== SELECTED ROW OBJECT IS BELOW ===');
    debugObject(selectedRow);

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
    debugString('Processing situation when all team answers become graded ..............................');

    debugString(`componentReference.allTeamIds.length === ${componentReference.allTeamIds.length}`);

    // проверяем, сколько команд есть в поле выбора команды
    if (componentReference.allTeamIds.length === 1) {
      // если в списке команд только текущая команда
      debugString(`There's only current team present, so we're switching to the displaying all teams`);

      // включаем отображение всех команд
      componentReference.displayingOnlyTeamsWithNotGradedAnswers = false;
      componentReference.notGradedAnswersArePresent = false;

    } else {
      // если в списке команд кроме текущей есть и другие команды
      debugString(`There are other teams list for the current displaying mode, removing current team from the list`);
      debugString('allTeamIds BEFORE REMOVAL below');
      debugObject(componentReference.allTeamIds);
      debugString('allTeamIds BEFORE REMOVAL above');

      const index = componentReference.allTeamIds.indexOf(teamId);
      debugString(`index of team id that should be removed ${index}`);

      // удаляем найденный элемент, не надо проверять index на -1, ибо элемент заведомо существует
      componentReference.allTeamIds.splice(index, 1); // удаляем из списка идентификаторов
      componentReference.teamTitleAndNumber.splice(index, 1); // удаляем из отображаемого списка

      debugString('allTeamIds AFTER REMOVAL below');
      debugObject(componentReference.allTeamIds);
      debugString('allTeamIds AFTER REMOVAL above');

      componentReference.selectedTeamId = componentReference.allTeamIds[0]; // первую команду из списка ставим как выбранную
      debugString(`current selectedTeamId is: ${componentReference.selectedTeamId}`);
    }


    debugString(`Now loading teams list and answers with emails for the team with id: ${componentReference.selectedTeamId}`);
    // загружаем команды и ответы для команды, чей id указан в параметрах
    componentReference.loadTeamsList(componentReference,
      componentReference.selectedTeamId, componentReference.displayingOnlyTeamsWithNotGradedAnswers,
      componentReference.populateTeamSelectionFieldAndLoadAnswersWithEmails);
  }


  private removeAnswerFromNotGradedAnswersList(componentReference: AnswersListComponent, answerId: number) {
    debugString('Removing answer from not-graded list. Answer id: ' + answerId);

    const index = componentReference.answersWithoutGradesDataSource.data.findIndex(oneAnswer => oneAnswer.id === answerId);
    debugString('Found index in data source: ' + index);

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
        debugString('Answers Import Dialog accepted ...');
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
    onSuccess: (componentReference: AnswersListComponent, loadedTeams: TeamDataModel[], previouslySelectedTeamId: number) => void): void {

    debugString(`Loading teams list and setting this team id as it is done: ${previouslySelectedTeamId}`);

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

  populateTeamSelectionFieldAndLoadAnswersWithEmails(componentReference: AnswersListComponent, loadedTeams: TeamDataModel[],
    previouslySelectedTeamId: number): void {

    debugString(`Populating teams list and setting this team id as it is done: ${previouslySelectedTeamId}`);

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

    debugString(`componentReference.allTeamIds is below:`);
    debugObject(componentReference.allTeamIds);

    debugString(`indexOfPreviouslySelectedTeamId: ${indexOfPreviouslySelectedTeamId}`);

    // если id ранее выбранной команды был в списке, выставляем его, иначе выставляем id первой команды из списка
    componentReference.selectedTeamId = indexOfPreviouslySelectedTeamId >= 0 ?
      componentReference.allTeamIds[indexOfPreviouslySelectedTeamId] : componentReference.allTeamIds[0];

    debugString(`componentReference.selectedTeamId: ${componentReference.selectedTeamId}`);

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
    const answersWithoutGradesList: AnswerDataModel[] = [];

    loadedAnswers.forEach((oneLoadedAnswer) => {
      componentReference.answersDataSource.data.push(oneLoadedAnswer);
      if (oneLoadedAnswer.grade === AnswerDataModel.GradeNone) {
        answersWithoutGradesList.push(oneLoadedAnswer);
      }
    });

    loadedAnswers.sort(compareAnswers);
    answersWithoutGradesList.sort(compareAnswers);

    componentReference.answersDataSource = new MatTableDataSource(loadedAnswers);
    componentReference.answersDataSource.sort = componentReference.allAnswersSortHandler;

    componentReference.answersWithoutGradesDataSource = new MatTableDataSource(answersWithoutGradesList);
    componentReference.answersWithoutGradesDataSource.sort = componentReference.answersWithoutGradesSortHandler;

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
        componentReference.emailsDataSource = new MatTableDataSource(loadedEmailsList);
        componentReference.emailsDataSource.sort = componentReference.loadedEmailsSortHandler;

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

    debugString('DISPLAYING ONLY TEAMS WITH NOT GRADED ANSWERS');
    debugString(`this.selectedTeamId: ${this.selectedTeamId}`);

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

    debugString('DISPLAYING ALL TEAMS');
    debugString(`this.selectedTeamId: ${this.selectedTeamId}`);

    this.displayingOnlyTeamsWithNotGradedAnswers = false;
    this.selectedRoundAlias = this.allRoundAliases[0];

    this.loadTeamsList(this,
      this.selectedTeamId, this.displayingOnlyTeamsWithNotGradedAnswers,
      this.populateTeamSelectionFieldAndLoadAnswersWithEmails);
  }

  //#endregion
}
