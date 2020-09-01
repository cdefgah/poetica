import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
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
  }
  //#endregion

  //#region EventHandlers
  actualRoundChanged(event: MatRadioChange) {
    this.selectedRoundAlias = event.value;
  }

  actualTeamChanged(event: MatSelectChange) {
    this.selectedTeamId = event.value;
  }

  onAnswerRowClicked(selectedRow: any) {
    const dialogConfig = AnswerDetailsComponent.getDialogConfigWithData(
      selectedRow
    );
    const dialogRef = this.dialog.open(AnswerDetailsComponent, dialogConfig);

    const componentReference = this;
    dialogRef.afterClosed().subscribe((result) => {
      if (result === AnswerDetailsComponent.DIALOG_GRADE_SET) {
        // если оценка была поставлена
        // если да, то проверяем, остались-ли ответы без оценок в системе
        const actionAllAnswersAreGraded = () => {
          componentReference.loadTeamsList(componentReference.loadAllDisplayedLists, componentReference, false);
        };
      }
    });
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
        // загружаем ответы заново и письма
        componentReference.loadAllDisplayedLists(componentReference);
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
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // если диалог был принят (accepted)
        // TODO - загружаем только импортированные ответы и переключаемся на команду, чьи ответы были импортированы
        // this.loadAllDisplayedLists(this);

        debugString('Reloaded answers listed below:');
        debugObject(this.answersDataSource);
      }
    });
  }
  //#endregion



  // TODO исключить глобальные переменные (поля классов) из всех методов. передача данных только через параметры вызова!!!!!
  // Если метод асинхронный, то нет резона что-то возвращать как return value.
  // Возвращаемые значения передаются в функцию onSuccess(); в качестве параметров и никак не меняют глобальное состояние!
  // Глобальное состояние меняется только в том случае, если вся цепочка вызовов функций отработала без ошибок и проблем.

  /**
   * loadTeamsList передаёт в onSuccess отсортированный список объектов Team и id-команды, которая была выбрана до вызова метода.
   * Если метод вызывается впервые, то id-команды равен undefined.
   * в onSuccess проверяем, входит-ли id-команды в список объектов. (метод find())
   * https://stackoverflow.com/questions/42580100/typescript-take-object-out-of-array-based-on-attribute-value
   * срубает меня, пойду спать. Завтра продолжу, если буду в состоянии.
   * 
   * 
   */

  // --------------------------------------------------------------

  loadTeamsList(onSuccess: Function, componentReference: AnswersListComponent, onlyWithNotGradedAnswers: boolean): [number[], string[]] {

    const url = onlyWithNotGradedAnswers ? '/teams/only-with-not-graded-answers' : '/teams/all';

    this.http.get(url).subscribe(
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

        const allTeamIdentifiers: number[] = [];
        const teamTitlesAndNumbers: string[] = [];

        // this.allTeamIds = [];
        // this.teamTitleAndNumber = [];
        // this.selectedTeamId = this.allTeamIds[0];

        sortedTeamsList.forEach((oneTeam) => {
          allTeamIdentifiers.push(oneTeam.id);
          teamTitlesAndNumbers.push(`${oneTeam.title} (${oneTeam.number})`);
        });

        // если есть хоть одна команда - работаем дальше
        // иначе - ничего не грузим больше, нет смысла
        if (this.selectedTeamId) {
          onSuccess(componentReference);
        }
      },
      (error) => this.reportServerError(error)
    );
  }

  loadAllDisplayedLists(componentReference: AnswersListComponent) {
    // componentReference.loadAnswersList(componentReference);
    // componentReference.loadEmailsList(componentReference);
  }

  loadAnswersForTeam(componentReference: AnswersListComponent, teamId: number, roundAlias: string) {
    // Если команд нет в системе, просто выходим, нечего загружать
    // письма (и ответы) без команд не импортируются
    // а удалить команду, при наличии ответов нельзя
    if (!teamId) {
      return;
    }

    const url = `/answers/${teamId}/${roundAlias}`;

    componentReference.http.get(url).subscribe(
      (loadedAnswers: AnswerDataModel[]) => {
        componentReference.separateAndSortLoadedAnswers(
          loadedAnswers,
          componentReference
        );
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
}