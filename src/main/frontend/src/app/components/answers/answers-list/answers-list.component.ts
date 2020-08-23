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

  notGradedAnswersArePresent = false;
  displayingOnlyTeamsWithNotGradedAnswers = false;

  constructor(private cdRef: ChangeDetectorRef, private http: HttpClient, private dialog: MatDialog) {
    super();
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.answersDataSource.sort = this.allAnswersSortHandler;
    this.answersWithoutGradesDataSource.sort = this.answersWithoutGradesSortHandler;
    this.emailsDataSource.sort = this.loadedEmailsSortHandler;

    const actionAllAnswersAreGraded = () => {
      this.displayingOnlyTeamsWithNotGradedAnswers = false;
      this.loadTeamsList(this.loadAllDisplayedLists, this, false);
    };

    const someAnswersAreNotGraded = () => {
      this.displayingOnlyTeamsWithNotGradedAnswers = true;
      this.loadTeamsList(this.loadAllDisplayedLists, this, true);
    };

    this.checkNotGradedAnswersPresence(someAnswersAreNotGraded, actionAllAnswersAreGraded);
  }

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
        // обновляем страницу со списками
        this.notGradedAnswersArePresent = true;
        this.displayingOnlyTeamsWithNotGradedAnswers = false;
        this.loadAllDisplayedLists(this);

        debugString('Reloaded answers listed below:');
        debugObject(this.answersDataSource);
      }
    });
  }

  loadTeamsList(onSuccess: Function, componentReference: AnswersListComponent, onlyWithNotGradedAnswers: boolean) {
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

        this.allTeamIds = [];
        this.teamTitleAndNumber = [];

        sortedTeamsList.forEach((oneTeam) => {
          this.allTeamIds.push(oneTeam.id);
          this.teamTitleAndNumber.push(`${oneTeam.title} (${oneTeam.number})`);
        });

        this.selectedTeamId = this.allTeamIds[0];

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
    componentReference.loadAnswersList(componentReference);
    componentReference.loadEmailsList(componentReference);
  }

  loadAnswersList(componentReference: AnswersListComponent) {
    // Если команд нет в системе, просто выходим, нечего загружать
    // письма (и ответы) без команд не импортируются
    // а удалить команду, при наличии ответов нельзя
    if (!this.selectedTeamId) {
      return;
    }

    const url = `/answers/${this.selectedTeamId}/${this.selectedRoundAlias}`;

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

  private separateAndSortLoadedAnswers(
    loadedAnswers: AnswerDataModel[],
    componentReference: AnswersListComponent
  ) {

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
    function compareAnswers(
      oneAnswer: AnswerDataModel,
      anotherAnswer: AnswerDataModel
    ) {
      if (oneAnswer.questionNumber < anotherAnswer.questionNumber) {
        return -1;
      } else if (oneAnswer.questionNumber < anotherAnswer.questionNumber) {
        return 1;
      } else {
        return compareEmailSentOnInTheAnswers(oneAnswer, anotherAnswer);
      }
    }

    function compareEmailSentOnInTheAnswers(
      oneAnswer: AnswerDataModel,
      anotherAnswer: AnswerDataModel
    ) {
      if (oneAnswer.emailSentOn < anotherAnswer.emailSentOn) {
        return -1;
      } else if (oneAnswer.emailSentOn < anotherAnswer.emailSentOn) {
        return 1;
      } else {
        return 0;
      }
    }
    // ---------------------------------------------
  }

  loadEmailsList(componentReference: AnswersListComponent) {
    // Если команд нет в системе, просто выходим, нечего загружать
    // письма (и ответы) без команд не импортируются
    // а удалить команду, при наличии ответов нельзя
    if (!this.selectedTeamId) {
      return;
    }

    const emailsUrl = `/emails/${this.selectedTeamId}/${this.selectedRoundAlias}`;

    componentReference.http.get(emailsUrl).subscribe(
      (loadedEmailsList: EmailDataModel[]) => {
        componentReference.emailsDataSource = new MatTableDataSource(loadedEmailsList);
        componentReference.emailsDataSource.sort = componentReference.loadedEmailsSortHandler;

        const digestUrl = `/emails/digest/${this.selectedTeamId}`;
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

  public turnOnDisplayingOnlyTeamsWithNonGradedAnswers() {
    this.displayingOnlyTeamsWithNotGradedAnswers = true;
    this.loadTeamsList(this.loadAllDisplayedLists, this, true);
  }

  public turnOffDisplayingOnlyTeamsWithNonGradedAnswers() {
    this.displayingOnlyTeamsWithNotGradedAnswers = false;
    this.loadTeamsList(this.loadAllDisplayedLists, this, false);
  }

  protected getMessageDialogReference(): MatDialog {
    return this.dialog;
  }

  private checkNotGradedAnswersPresence(doIfNotGradedAnswersPresent: Function, doIfAllAnswersAreGraded: Function) {
    const answerWithoutGradesCheckUri = '/answers/not-graded-presence';

    this.http.get(answerWithoutGradesCheckUri).subscribe((teamIdInfo: any) => {
      const foundTeamIdString: string = teamIdInfo ? teamIdInfo.toString() : '';

      if (!(foundTeamIdString && foundTeamIdString.length > 0)) {
        // если все ответы имеют оценку
        this.notGradedAnswersArePresent = false;
        doIfAllAnswersAreGraded();
      } else {
        // если есть ответы без оценок.
        this.notGradedAnswersArePresent = true;
        doIfNotGradedAnswersPresent();
      }
    },
      (error) => this.reportServerError(error)
    );
  }

  actualRoundChanged(event: MatRadioChange) {
    this.selectedRoundAlias = event.value;
    this.loadAllDisplayedLists(this);
  }

  actualTeamChanged(event: MatSelectChange) {
    this.selectedTeamId = event.value;
    this.loadAllDisplayedLists(this);
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
          componentReference.displayingOnlyTeamsWithNotGradedAnswers = false;
          componentReference.loadTeamsList(componentReference.loadAllDisplayedLists, componentReference, false);
        };

        const someAnswersAreNotGraded = () => {
          // загружаем команды, так как может быть более одной команды с ответами без оценок
          // и чтобы список команд с ответами без оценок тоже изменился, надо загрузить команды
          // TODO тут есть поле для оптимизации, и этим надо будет заняться попозже.
          const doLoadAnswersList = () => { componentReference.loadAnswersList(componentReference) };

          componentReference.loadTeamsList(doLoadAnswersList, componentReference, true);
        };

        componentReference.checkNotGradedAnswersPresence(someAnswersAreNotGraded, actionAllAnswersAreGraded);
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
}
