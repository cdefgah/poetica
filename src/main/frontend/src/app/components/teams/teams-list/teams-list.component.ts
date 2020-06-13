import { Component, OnInit } from "@angular/core";
import { Team } from "src/app/model/Team";
import { HttpClient } from "@angular/common/http";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { TeamDetailsComponent } from "../team-details/team-details.component";
import { AbstractInteractiveComponentModel } from "../../core/base/AbstractInteractiveComponentModel";

@Component({
  selector: "app-teams-list",
  templateUrl: "./teams-list.component.html",
  styleUrls: ["./teams-list.component.css"],
})
export class TeamsListComponent extends AbstractInteractiveComponentModel
  implements OnInit {
  constructor(private http: HttpClient, private dialog: MatDialog) {
    super();
    this.loadOneTeamModelConstraints();
    this.loadTeamsList();
  }

  ngOnInit() {}

  displayedColumns: string[] = ["number", "title"];

  dataSource: Team[];

  modelConstraints: Map<string, string>;

  protected getMessageDialogReference(): MatDialog {
    return this.dialog;
  }

  onRowClicked(row: any) {
    this.openDetailsDialog(row);
  }

  openDetailsDialog(selectedRow?: any) {
    const dialogConfig = TeamDetailsComponent.getDialogConfigWithData(
      this.modelConstraints,
      selectedRow
    );
    var dialogRef = this.dialog.open(TeamDetailsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result) => {
      if (result != TeamDetailsComponent.DIALOG_RESULT_DECLINED) {
        // если диалог был принят (accepted), либо была удалена запись о команде
        // обновляем таблицу со списком команд
        this.loadTeamsList();
      }
    });
  }

  loadOneTeamModelConstraints() {
    const url: string = "/teams/model-constraints";
    this.http.get(url).subscribe(
      (data: Map<string, string>) => {
        this.modelConstraints = data;
        Team.initializeRegexpValidator(this.modelConstraints);
      },
      (error) => this.reportServerError(error)
    );
  }

  loadTeamsList() {
    const url: string = "/teams/all";
    this.http.get(url).subscribe(
      (data: Team[]) => {
        this.dataSource = data;
      },
      (error) => this.reportServerError(error)
    );
  }
}
