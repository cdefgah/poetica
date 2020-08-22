import { Component, OnInit, ViewChild } from '@angular/core';
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
  implements OnInit {
  selectedTeamId: number;
  allTeamIds: number[];
  teamTitleAndNumber: string[];

  allRoundAliases: string[] = ['0', '1', '2'];
  allRoundTitles: string[] = [
    'Все',
    'Предварительный тур',
    'Окончательный тур',
  ];

  @ViewChild(MatSort, { static: true }) allAnswersSortHandler: MatSort;
  @ViewChild(MatSort, { static: true }) answersWithoutGradesSortHandler: MatSort;
  @ViewChild(MatSort, { static: true }) loadedEmailsSortHandler: MatSort;

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

  constructor(private http: HttpClient, private dialog: MatDialog) {
    super();

    this.loadTeamsList(this.loadAllDisplayedLists, this);
  }

  ngOnInit() {
    this.answersDataSource.sort = this.allAnswersSortHandler;
    this.answersWithoutGradesDataSource.sort = this.answersWithoutGradesSortHandler;
    this.emailsDataSource.sort = this.loadedEmailsSortHandler;
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
        this.loadAllDisplayedLists(this);

        debugString('Reloaded answers listed below:');
        debugObject(this.answersDataSource);
      }
    });
  }

  loadTeamsList(onSuccess: Function, componentReference: AnswersListComponent) {
    const url = '/teams/all';

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
        componentReference.answersDataSource = new MatTableDataSource(loadedAnswers);
        componentReference.answersDataSource.sort = componentReference.allAnswersSortHandler;

        const answersWithoutGradesList = componentReference.separateAndSortLoadedAnswers(
          loadedAnswers,
          componentReference
        );

        componentReference.answersWithoutGradesDataSource = new MatTableDataSource(answersWithoutGradesList);
        componentReference.answersWithoutGradesDataSource.sort = componentReference.answersWithoutGradesSortHandler;
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

    return answersWithoutGradesList;

    // loadedAnswers.sort(compareAnswers);
    // answersWithoutGradesList.sort(compareAnswers);   

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

  protected getMessageDialogReference(): MatDialog {
    return this.dialog;
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
    debugString('Answer row clicked. Selected row is below.');
    debugObject(selectedRow);

    const dialogConfig = AnswerDetailsComponent.getDialogConfigWithData(
      selectedRow
    );
    const dialogRef = this.dialog.open(AnswerDetailsComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result === AnswerDetailsComponent.DIALOG_GRADE_SET) {
        // если оценка была поставлена, то получаем заново таблицы
        // TODO очень неоптимальный код тут.
        // Из-за одной оценки грузить заново все ответы выбранной команды.
        // Надо упростить.
        this.loadAnswersList(this);
      }
    });
  }

  onEmailRowClicked(selectedRow: any) {
    debugString('Email row clicked. Selected row is below.');
    debugObject(selectedRow);

    const dialogConfig = EmailDetailsComponent.getDialogConfigWithData(
      selectedRow
    );
    const dialogRef = this.dialog.open(EmailDetailsComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // если письмо было удалено (+ все ответы из него)
        // загружаем ответы заново и письма
        this.loadAnswersList(this);
        this.loadEmailsList(this);
      }
    });
  }
}
