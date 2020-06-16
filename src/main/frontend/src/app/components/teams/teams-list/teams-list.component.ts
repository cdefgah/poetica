import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { TeamDetailsComponent } from "../team-details/team-details.component";
import { AbstractInteractiveComponentModel } from "../../core/base/AbstractInteractiveComponentModel";
import { TeamShallowValidationService } from "../../core/validators/TeamShallowValidationService";
import { TeamDataModel } from "src/app/model/TeamDataModel";

@Component({
  selector: "app-teams-list",
  templateUrl: "./teams-list.component.html",
  styleUrls: ["./teams-list.component.css"],
})
export class TeamsListComponent extends AbstractInteractiveComponentModel
  implements OnInit {
  constructor(private http: HttpClient, private dialog: MatDialog) {
    super();
    this.teamValidationService = new TeamShallowValidationService(http);
    if (!this.teamValidationService.isInternalStateCorrect()) {
      this.displayMessage(this.teamValidationService.brokenStateDescription);
      return;
    }

    this.loadTeamsList();
  }

  private teamValidationService: TeamShallowValidationService;

  ngOnInit() {}

  displayedColumns: string[] = ["number", "title"];

  dataSource: TeamDataModel[];

  protected getMessageDialogReference(): MatDialog {
    return this.dialog;
  }

  onRowClicked(row: any) {
    this.openDetailsDialog(row);
  }

  openDetailsDialog(selectedRow?: any) {
    const dialogConfig = TeamDetailsComponent.getDialogConfigWithData(
      this.teamValidationService,
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

  loadTeamsList() {
    const url: string = "/teams/all";
    this.http.get(url).subscribe(
      (data: TeamDataModel[]) => {
        this.dataSource = data;
      },
      (error) => this.reportServerError(error)
    );
  }
}
