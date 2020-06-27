import { Component, OnInit } from "@angular/core";
import { MatRadioChange, MatDialog, MatSelectChange } from "@angular/material";
import { HttpClient } from "@angular/common/http";
import { AnswerDataModel } from "src/app/model/AnswerDataModel";
import { TeamDataModel } from "src/app/model/TeamDataModel";
import { EmailDataModel } from "src/app/model/EmailDataModel";
import { AnswersListImporterComponent } from "../answers-list-importer/answers-list-importer.component";
import { AbstractInteractiveComponentModel } from "src/app/components/core/base/AbstractInteractiveComponentModel";
import { EmailsCountDigest } from "./support/EmailsCountDigest";

@Component({
  selector: "app-answers-list",
  templateUrl: "./answers-list.component.html",
  styleUrls: ["./answers-list.component.css"],
})
export class AnswersListComponent extends AbstractInteractiveComponentModel
  implements OnInit {
  selectedTeamId: number;
  allTeamIds: number[];
  teamTitleAndNumber: string[];

  allRoundAliases: string[] = ["0", "1", "2"];
  allRoundTitles: string[] = [
    "Все",
    "Предварительный тур",
    "Окончательный тур",
  ];

  selectedRoundAlias: string = this.allRoundAliases[0];

  answersDataSource: AnswerDataModel[];

  answersWithoutGradesDataSource: AnswerDataModel[];

  emailsDataSource: EmailDataModel[];

  /**
   * Инициализируем пустым дайджестом, чтобы не сломались компоненты, привязанные к этому свойству.
   */
  emailsCountDigest: EmailsCountDigest = EmailsCountDigest.emptyDigest;

  displayedAnswerColumns: string[] = [
    "number",
    "emailSentOn",
    "body",
    "roundNumber",
    "comment",
  ];

  displayedEmailColumns: string[] = [
    "sentOn",
    "importedOn",
    "questionNumbersSequence",
  ];

  constructor(private http: HttpClient, private dialog: MatDialog) {
    super();

    this.loadTeamsList(this.loadAllDisplayedLists, this);
  }

  ngOnInit() {}

  public checkPrerequisitesAndDoImportAnswers(): void {
    var questionsMaxNumberEndPointUrl: string = "/questions/max-number";
    this.http.get(questionsMaxNumberEndPointUrl).subscribe(
      (maxNumberOfRegisteredQuestion: number) => {
        if (maxNumberOfRegisteredQuestion > 0) {
          // вопросы в базе представлены, проверяем наличие команд
          var teamsTotalEndpointUrl: string = "/teams/total-number";
          this.http.get(teamsTotalEndpointUrl).subscribe(
            (numberOfTeamsPresent: number) => {
              if (numberOfTeamsPresent > 0) {
                this.importAnswers();
              } else {
                this.displayMessage(
                  "Не найдено зарегистрированных команд. Пожалуйста зарегистрируйте команды в системе, прежде чем импортировать ответы."
                );
              }
            },
            (error) => {
              this.reportServerError(
                error,
                "Не удалось получить информацию из базы данных о количестве команд."
              );
            }
          );
        } else {
          this.displayMessage(
            "Не удалось найти зарегистрированных заданий. Пожалуйста импортируйте в систему задания прежде чем импортировать ответы."
          );
        }
      },
      (error) => {
        this.reportServerError(
          error,
          "Не удалось получить информацию из базы данных о количестве заданий."
        );
      }
    );
  }

  private importAnswers() {
    const importDialogConfig = AnswersListImporterComponent.getDialogConfigWithData();
    var dialogRef = this.dialog.open(
      AnswersListImporterComponent,
      importDialogConfig
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // если диалог был принят (accepted)
        // обновляем страницу со списками
        this.loadAllDisplayedLists(this);
      }
    });
  }

  loadTeamsList(onSuccess: Function, componentReference: AnswersListComponent) {
    const url: string = "/teams/all";

    this.http.get(url).subscribe(
      (data: TeamDataModel[]) => {
        this.allTeamIds = [];
        this.teamTitleAndNumber = [];

        data.forEach((oneTeam) => {
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

    var url: string = `/answers/${this.selectedTeamId}/${this.selectedRoundAlias}`;

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
    componentReference.answersDataSource = [];
    componentReference.answersWithoutGradesDataSource = [];

    loadedAnswers.forEach((oneLoadedAnswer) => {
      componentReference.answersDataSource.push(oneLoadedAnswer);
      if (oneLoadedAnswer.grade == AnswerDataModel.GradeNone) {
        componentReference.answersWithoutGradesDataSource.push(oneLoadedAnswer);
      }
    });

    componentReference.answersDataSource.sort(compareAnswers);
    componentReference.answersWithoutGradesDataSource.sort(compareAnswers);

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

    var emailsUrl: string = `/emails/${this.selectedTeamId}/${this.selectedRoundAlias}`;

    componentReference.http.get(emailsUrl).subscribe(
      (loadedEmailsList: EmailDataModel[]) => {
        componentReference.emailsDataSource = loadedEmailsList;

        var digestUrl: string = `/emails/digest/${this.selectedTeamId}`;
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

  onAnswerRowClicked(row: any) {
    // this.openDetailsDialog(row);
  }

  onEmailRowClicked(row: any) {
    // this.openDetailsDialog(row);
  }
}
