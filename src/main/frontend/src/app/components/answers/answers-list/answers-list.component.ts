import { Component, OnInit } from "@angular/core";
import { MatRadioChange, MatDialog } from "@angular/material";
import { HttpClient } from "@angular/common/http";
import { Answer } from "src/app/model/Answer";
import { Team } from "src/app/model/Team";
import { Email } from "src/app/model/Email";
import { AnswersListImporterComponent } from "../answers-list-importer/answers-list-importer.component";
import { AbstractInteractiveComponentModel } from "src/app/components/core/base/AbstractInteractiveComponentModel";
import { TeamShallowValidationService } from "../../core/base/TeamShallowValidationService";

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

  private teamShallowValidationService: TeamShallowValidationService;

  emailModelConstraints: Map<string, string>;

  answerModelConstraints: Map<string, string>;

  selectedRoundAlias: string = this.allRoundAliases[0];

  answersDataSource: Answer[];

  answersWithoutGradesDataSource: Answer[];

  emailsDataSource: Email[];

  displayedAnswerColumns: string[] = [
    "number",
    "body",
    "roundNumber",
    "comment",
  ];

  displayedEmailColumns: string[] = [
    "sentOn",
    "processedOn",
    "numbersOfAnsweredQuestions",
  ];

  loadEmailModelConstraints() {
    const url: string = "/emails/model-constraints";
    this.http.get(url).subscribe(
      (data: Map<string, string>) => (this.emailModelConstraints = data),
      (error) => this.reportServerError(error)
    );
  }

  loadAnswerModelConstraints() {
    const url: string = "/answers/model-constraints";
    this.http.get(url).subscribe(
      (data: Map<string, string>) => (this.answerModelConstraints = data),
      (error) => this.reportServerError(error)
    );
  }

  constructor(private http: HttpClient, private dialog: MatDialog) {
    super();

    this.teamShallowValidationService = new TeamShallowValidationService(http);
    if (!this.teamShallowValidationService.isInternalStateCorrect()) {
      this.displayMessage(
        this.teamShallowValidationService.brokenStateDescription
      );
      return;
    }

    this.loadEmailModelConstraints();
    this.loadAnswerModelConstraints();
    this.loadTeamsList();
    this.loadAnswersList();
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
    const importDialogConfig = AnswersListImporterComponent.getDialogConfigWithData(
      this.emailModelConstraints,
      this.answerModelConstraints
    );
    var dialogRef = this.dialog.open(
      AnswersListImporterComponent,
      importDialogConfig
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // если диалог был принят (accepted)
        // обновляем таблицу со списком вопросов
        this.loadAnswersList();
      }
    });
  }

  loadTeamsList() {
    const url: string = "/teams/all";

    this.http.get(url).subscribe(
      (data: Team[]) => {
        this.allTeamIds = [];
        this.teamTitleAndNumber = [];

        data.forEach((oneTeam) => {
          this.allTeamIds.push(oneTeam.id);
          this.teamTitleAndNumber.push(`${oneTeam.title} (${oneTeam.number})`);
        });

        this.selectedTeamId = this.allTeamIds[0];
      },
      (error) => this.reportServerError(error)
    );
  }

  loadAnswersList() {
    /**

    var urlBase: string = "/answers/";
    var url = urlBase;

    this.http.get(url).subscribe(
      (data: Answer[]) => {
        this.dataSource = data;
      },
      error => this.reportServerError(error)
    );
  }

  actualRoundChanged(event: MatRadioChange) {
    var receivedRoundAlias = event.value;
    if (this.selectedRoundAlias != receivedRoundAlias) {
      this.selectedRoundAlias = receivedRoundAlias;
      this.loadAnswersList();
    }
     */
  }

  protected getMessageDialogReference(): MatDialog {
    return this.dialog;
  }

  actualRoundChanged(event: MatRadioChange) {
    var receivedRoundAlias = event.value;
    if (this.selectedRoundAlias != receivedRoundAlias) {
      this.selectedRoundAlias = receivedRoundAlias;
      this.loadAnswersList();
    }
  }

  onAnswerRowClicked(row: any) {
    // this.openDetailsDialog(row);
  }

  onEmailRowClicked(row: any) {
    // this.openDetailsDialog(row);
  }
}
