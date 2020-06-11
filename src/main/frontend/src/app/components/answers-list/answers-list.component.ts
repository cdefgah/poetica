import { Component, OnInit } from "@angular/core";
import { MatRadioChange, MatDialog, MatDialogConfig } from "@angular/material";
import { HttpClient } from "@angular/common/http";
import { Answer } from "src/app/model/Answer";
import { MessageBoxComponent } from "../message-box/message-box.component";
import { Team } from "src/app/model/Team";
import { Email } from "src/app/model/Email";
import { AnswersListImporterComponent } from "../answers-list-importer/answers-list-importer.component";

@Component({
  selector: "app-answers-list",
  templateUrl: "./answers-list.component.html",
  styleUrls: ["./answers-list.component.css"],
})
export class AnswersListComponent implements OnInit {
  selectedTeamId: number;
  allTeamIds: number[];
  teamTitleAndNumber: string[];

  allRoundAliases: string[] = ["0", "1", "2"];
  allRoundTitles: string[] = [
    "Все",
    "Предварительный тур",
    "Окончательный тур",
  ];

  teamModelConstraints: Map<string, string>;

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

  loadOneTeamModelConstraints() {
    var url: string = "/teams/model-constraints";
    this.http.get(url).subscribe(
      (data: Map<string, string>) => {
        this.teamModelConstraints = data;
        Team.initializeRegexpValidator(this.teamModelConstraints);
      },
      (error) => this.displayErrorMessage(error)
    );
  }

  loadEmailModelConstraints() {
    var url: string = "/emails/model-constraints";
    this.http.get(url).subscribe(
      (data: Map<string, string>) => (this.emailModelConstraints = data),
      (error) => this.displayErrorMessage(error)
    );
  }

  loadAnswerModelConstraints() {
    var url: string = "/answers/model-constraints";
    this.http.get(url).subscribe(
      (data: Map<string, string>) => (this.answerModelConstraints = data),
      (error) => this.displayErrorMessage(error)
    );
  }

  constructor(private http: HttpClient, private dialog: MatDialog) {
    this.loadOneTeamModelConstraints();
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
                var msgBoxConfig: MatDialogConfig = MessageBoxComponent.getDialogConfigWithData(
                  "Не найдено зарегистрированных команд. Пожалуйста зарегистрируйте команды в системе, прежде чем импортировать ответы.",
                  "Внимание"
                );

                this.dialog.open(MessageBoxComponent, msgBoxConfig);
              }
            },
            (error) => {
              var msgBoxConfig: MatDialogConfig = MessageBoxComponent.getDialogConfigWithData(
                "Не удалось получить информацию из базы данных о количестве команд. " +
                  "Дополнительная информация от сервера: Сообщение: " +
                  error.message +
                  " \nКод ошибки: " +
                  error.status,
                "Ошибка"
              );

              this.dialog.open(MessageBoxComponent, msgBoxConfig);
            }
          );
        } else {
          var msgBoxConfig: MatDialogConfig = MessageBoxComponent.getDialogConfigWithData(
            "Не удалось найти зарегистрированных заданий. Пожалуйста импортируйте в систему задания прежде чем импортировать ответы.",
            "Внимание"
          );

          this.dialog.open(MessageBoxComponent, msgBoxConfig);
        }
      },
      (error) => {
        var msgBoxConfig: MatDialogConfig = MessageBoxComponent.getDialogConfigWithData(
          "Не удалось получить информацию из базы данных о количестве заданий. " +
            "Дополнительная информация от сервера: Сообщение: " +
            error.message +
            " \nКод ошибки: " +
            error.status,
          "Ошибка"
        );

        this.dialog.open(MessageBoxComponent, msgBoxConfig);
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
    var url: string = "/teams/all";

    this.http.get(url).subscribe(
      (data: Team[]) => {
        this.allTeamIds = [];
        this.teamTitleAndNumber = [];

        data.forEach((oneTeam) => {
          this.allTeamIds.push(oneTeam.id);
          this.teamTitleAndNumber.push(
            oneTeam.title + " (" + oneTeam.number + ")"
          );
        });

        this.selectedTeamId = this.allTeamIds[0];
      },
      (error) => this.displayErrorMessage(error)
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
      error => this.displayErrorMessage(error)
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

  displayErrorMessage(error: any) {
    var errorMessage: string =
      error.error +
      ". " +
      "Код статуса: " +
      error.status +
      ". " +
      "Сообщение сервера: '" +
      error.message +
      "'";

    var msgBoxConfig: MatDialogConfig = MessageBoxComponent.getDialogConfigWithData(
      errorMessage,
      "Ошибка"
    );

    this.dialog.open(MessageBoxComponent, msgBoxConfig);
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
