import { Component, OnInit } from "@angular/core";
import { MatRadioChange, MatDialog, MatSelectChange } from "@angular/material";
import { HttpClient } from "@angular/common/http";
import { AnswerDataModel } from "src/app/model/AnswerDataModel";
import { TeamDataModel } from "src/app/model/TeamDataModel";
import { EmailDataModel } from "src/app/model/EmailDataModel";
import { AnswersListImporterComponent } from "../answers-list-importer/answers-list-importer.component";
import { AbstractInteractiveComponentModel } from "src/app/components/core/base/AbstractInteractiveComponentModel";
import { debugString, debugObject } from "src/app/utils/Config";

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

  displayedAnswerColumns: string[] = [
    "number",
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
    const importDialogConfig = AnswersListImporterComponent.getDialogConfigWithData();
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
      (data: TeamDataModel[]) => {
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
     */
  }

  loadAllDisplayedLists() {
    this.loadEmailsList();
  }

  loadEmailsList() {
    var url: string = `/emails/${this.selectedTeamId}/${this.selectedRoundAlias}`;

    this.http.get(url).subscribe(
      (data: EmailDataModel[]) => {
        this.emailsDataSource = data;
      },
      (error) => this.reportServerError(error)
    );
  }

  protected getMessageDialogReference(): MatDialog {
    return this.dialog;
  }

  actualRoundChanged(event: MatRadioChange) {
    var receivedRoundAlias = event.value;
    if (this.selectedRoundAlias != receivedRoundAlias) {
      this.selectedRoundAlias = receivedRoundAlias;
      this.loadAllDisplayedLists();
    }
  }

  actualTeamChanged(event: MatSelectChange) {
    var receivedTeamId: number = event.value;
    if (this.selectedTeamId != receivedTeamId) {
      this.selectedTeamId = receivedTeamId;
      this.loadAllDisplayedLists();
    }
  }

  onAnswerRowClicked(row: any) {
    // this.openDetailsDialog(row);
  }

  onEmailRowClicked(row: any) {
    // this.openDetailsDialog(row);
  }
}
