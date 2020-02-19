import { Component, OnInit } from "@angular/core";
import { Team } from "src/app/model/Team";
import { HttpClient } from "@angular/common/http";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { TeamDetailsComponent } from "../team-details/team-details.component";
import { MessageBoxComponent } from "../message-box/message-box.component";

@Component({
  selector: "app-teams-list",
  templateUrl: "./teams-list.component.html",
  styleUrls: ["./teams-list.component.css"]
})
export class TeamsListComponent implements OnInit {
  constructor(private http: HttpClient, private dialog: MatDialog) {
    this.loadOneTeamModelConstraints();
    this.loadTeamsList();
  }

  ngOnInit() {}

  displayedColumns: string[] = ["number", "title"];

  dataSource: Team[];

  modelConstraints: Map<string, string>;

  onRowClicked(row: any) {
    console.log("**** onRowClicked --- start");
    console.dir(row);

    this.openDetailsDialog(row);

    console.log("**** onRowClicked --- end");
  }

  openDetailsDialog(selectedRow?: any) {
    const dialogConfig = TeamDetailsComponent.getDialogConfigWithData(
      this.modelConstraints,
      selectedRow
    );
    var dialogRef = this.dialog.open(TeamDetailsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // если диалог был принят (accepted)
        // обновляем таблицу со списком команд
        this.loadTeamsList();
      }
    });
  }

  loadOneTeamModelConstraints() {
    var url: string = "/teams/model-constraints";
    this.http.get(url).subscribe(
      (data: Map<string, string>) => {
        this.modelConstraints = data;
        Team.initializeRegexpValidator(this.modelConstraints);
      },
      error => this.displayErrorMessage(error)
    );
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

  loadTeamsList() {
    var url: string = "/teams/all";

    this.http.get(url).subscribe(
      (data: Team[]) => {
        this.dataSource = data;
      },
      error => this.displayErrorMessage(error)
    );
  }
}
