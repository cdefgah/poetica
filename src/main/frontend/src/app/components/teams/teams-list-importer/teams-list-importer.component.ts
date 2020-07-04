import { Component, OnInit, Inject } from "@angular/core";
import { AbstractInteractiveComponentModel } from "../../core/base/AbstractInteractiveComponentModel";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
  MatDialogConfig,
} from "@angular/material/dialog";
import { HttpClient } from "@angular/common/http";
import { ConfirmationDialogComponent } from "../../core/confirmation-dialog/confirmation-dialog.component";
import { TeamDataModel } from "src/app/model/TeamDataModel";

@Component({
  selector: "app-teams-list-importer",
  templateUrl: "./teams-list-importer.component.html",
  styleUrls: ["./teams-list-importer.component.css"],
})
export class TeamsListImporterComponent
  extends AbstractInteractiveComponentModel
  implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private httpClient: HttpClient,
    public dialog: MatDialogRef<TeamsListImporterComponent>,
    public otherDialog: MatDialog
  ) {
    super();
  }

  static getDialogConfigWithData(): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "62%";

    return dialogConfig;
  }

  displayImportButton: boolean = false;

  displayedTeamColumns: string[] = ["number", "title"];

  textWithTeamsList: string = "";

  ngOnInit(): void {}

  teams: TeamDataModel[];

  firstStepErrorMessage: string = "";

  get IsFirstStepOk(): boolean {
    return this.firstStepErrorMessage.length == 0;
  }

  get errorPresent(): boolean {
    return !this.IsFirstStepOk;
  }

  get errorsFound(): string {
    return this.firstStepErrorMessage.trim();
  }

  get allThingsAreOk(): boolean {
    return !this.errorPresent;
  }

  get lastStepTitle(): string {
    if (this.allThingsAreOk) {
      return "Предварительный просмотр и импорт";
    } else {
      return "Информация об ошибках";
    }
  }

  protected getMessageDialogReference(): MatDialog {
    return this.otherDialog;
  }

  cancelDialog() {
    var confirmationDialogConfig: MatDialogConfig = ConfirmationDialogComponent.getDialogConfigWithData(
      "Прервать импорт команд?"
    );

    var dialogRef = this.otherDialog.open(
      ConfirmationDialogComponent,
      confirmationDialogConfig
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // если диалог был принят (accepted)
        this.dialog.close(false);
      }
    });
  }

  onStepChange(event: any) {}

  doImportTeams() {}
}
