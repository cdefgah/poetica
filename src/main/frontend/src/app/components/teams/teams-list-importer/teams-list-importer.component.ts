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
import { debugString } from "src/app/utils/Config";
import { TeamValidationService } from "../../core/validators/TeamValidationService";

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
    public otherDialog: MatDialog,
    teamValidationService: TeamValidationService
  ) {
    super();
    this._teamValidationService = teamValidationService;
  }

  private _teamValidationService: TeamValidationService;

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

  processTextWithTeamsList(onSuccess: Function, onFailure: Function) {}

  textWithTeamsListProcessedOk(
    currentComponentReference: TeamsListImporterComponent,
    teams2Import: TeamDataModel[]
  ) {
    currentComponentReference.teams = teams2Import;
    currentComponentReference.firstStepErrorMessage = ""; // нет ошибок
  }

  processingTextWithTeamsListFailed(
    currentComponentReference: TeamsListImporterComponent,
    errorMessage: string
  ) {
    currentComponentReference.firstStepErrorMessage = errorMessage;
  }

  onStepChange(event: any) {
    // если перешли на нулевой шаг с любого
    if (event.selectedIndex == 0) {
      // сбрасываем состояние всех контролирующих переменных
      // и выходим
      debugString("Switched to the first step. Resetting vars and exiting.");
      this.resetStepperVariables(event);
      return;
    }

    if (event.previouslySelectedIndex == 0) {
      // если ушли с первого шага (нулевой индекс), то обрабатываем список команд
      debugString("Moving from the first step. Processing teams list.");

      // обрабатываем список команд
      this.processTextWithTeamsList(
        this.textWithTeamsListProcessedOk,
        this.processingTextWithTeamsListFailed
      );
    }

    // пересчитываем признак, по которому мы определяем
    // показывать или нет кнопку импорта ответов
    this.updateDisplayImportButton(event);
  }

  doImportTeams() {}

  private resetStepperVariables(stepChangeEvent: any): void {
    this.firstStepErrorMessage = "";
    this.updateDisplayImportButton(stepChangeEvent);
  }

  private updateDisplayImportButton(stepChangeEvent: any) {
    // последний шаг в степпере имеет индекс 2 (0, 1, 2)
    // кнопку показываем в том случае, если мы пришли на последний шаг
    // и у нас всё в порядке, то есть нет ошибок.
    this.displayImportButton =
      stepChangeEvent.selectedIndex == 2 && this.allThingsAreOk;
  }
}
