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

  modelConstraints: Map<string, string>;

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

  constructor(private http: HttpClient, private dialog: MatDialog) {
    this.loadTeamsList();
    this.loadAnswersList();
  }

  ngOnInit() {}

  ImportAnswers() {
    const importDialogConfig = AnswersListImporterComponent.getDialogConfigWithData(
      this.modelConstraints
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
