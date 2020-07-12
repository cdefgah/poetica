import { Component, OnInit, Inject } from "@angular/core";
import { TeamDataModel } from "src/app/data-model/TeamDataModel";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
  MatDialogConfig,
} from "@angular/material";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AbstractInteractiveComponentModel } from "../../core/base/AbstractInteractiveComponentModel";
import { TeamValidationService } from "../../core/validators/TeamValidationService";
import { debugString, debugObject } from "src/app/utils/Config";

@Component({
  selector: "app-team-details",
  templateUrl: "./team-details.component.html",
  styleUrls: ["./team-details.component.css"],
})
export class TeamDetailsComponent extends AbstractInteractiveComponentModel
  implements OnInit {
  private static readonly KEY_DIALOG_ID = "id";
  private static readonly KEY_DIALOG_MODEL_VALIDATOR_SERVICE =
    "modelValidatorService";

  public static readonly DIALOG_RESULT_ACCEPTED: number = 1;
  public static readonly DIALOG_RESULT_DECLINED: number = 2;
  public static readonly DIALOG_RESULT_DELETE_ACTION: number = 3;

  private readonly _modelValidatorService: TeamValidationService;

  dialogTitle: string;

  team: TeamDataModel;
  teamCopy: TeamDataModel;

  teamNumberIsIncorrect: boolean = false;
  teamTitleIsIncorrect: boolean = false;

  serverResponse: any;

  isExistingRecord: boolean;

  static getDialogConfigWithData(
    modelValidatorService: TeamValidationService,
    row?: any
  ): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "29%";

    dialogConfig.data = new Map<string, any>();

    dialogConfig.data[
      TeamDetailsComponent.KEY_DIALOG_MODEL_VALIDATOR_SERVICE
    ] = modelValidatorService;

    debugString("Checking the row validity");
    debugString(row);
    if (row) {
      debugString("Checking the row validity ... row is TRUE");
      dialogConfig.data[TeamDetailsComponent.KEY_DIALOG_ID] =
        row[TeamDetailsComponent.KEY_DIALOG_ID];
    } else {
      debugString("Checking the row validity - ROW IS FALSE");
    }

    return dialogConfig;
  }

  /**
   * Выполняет сброс флагов валидации,
   * чтобы не подсвечивались подписи для незаполненных полей.
   */
  private resetValidationFlags() {
    this.teamNumberIsIncorrect = false;
    this.teamTitleIsIncorrect = false;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private http: HttpClient,
    public dialog: MatDialogRef<TeamDetailsComponent>,
    public otherDialog: MatDialog
  ) {
    super();

    // инициализируем объект team сразу первой строчкой
    // так как к нему подключены (bind)
    // свойства в html-template комепонента
    // и если не проинициализировать объект сразу
    // то компонент может попытаться (асинхронно) получить свойство
    // объекта, который мы ещё не проинициализировали,
    // например в случаях, когда get запрос ещё не закончил выполняться
    this.team = TeamDataModel.emptyTeam;

    this._modelValidatorService =
      dialogData[TeamDetailsComponent.KEY_DIALOG_MODEL_VALIDATOR_SERVICE];

    var teamId = dialogData[TeamDetailsComponent.KEY_DIALOG_ID];

    if (teamId) {
      // редактируем существующее задание
      this.isExistingRecord = true;
      const url: string = `/teams/${teamId}`;
      this.http.get(url).subscribe(
        (data: Map<string, any>) => {
          this.team = TeamDataModel.createTeamFromMap(data);
          this.teamCopy = TeamDataModel.createTeamFromMap(data);

          this.dialogTitle = this.getDialogTitle(this.team);
        },
        (error) => this.reportServerError(error)
      );
    } else {
      // создаём объект новой команды и заголовок диалога для новой команды
      this.team = TeamDataModel.createtTeam();
      this.isExistingRecord = false;
      this.dialogTitle = this.getDialogTitle();
    }
  }

  ngOnInit(): void {}

  protected getMessageDialogReference(): MatDialog {
    return this.otherDialog;
  }

  acceptDialog() {
    this.resetValidationFlags();
    if (this.validateFields()) {
      if (!this.team.id) {
        // добавляем новую запись
        const payload = new HttpParams()
          .set("teamNumber", this.team.number.trim())
          .set("teamTitle", this.team.title.trim());

        this.http.post("/teams", payload).subscribe(
          (data) => {
            this.serverResponse = data;
            this.dialog.close(TeamDetailsComponent.DIALOG_RESULT_ACCEPTED);
          },
          (error) => this.reportServerError(error)
        );
      } else {
        // обновляем существующую запись
        var newTeamNumber: string =
          this.team.number != this.teamCopy.number ? this.team.number : "";

        var newTeamTitle: string =
          this.team.title != this.teamCopy.title ? this.team.title : "";

        if (newTeamNumber.length > 0 || newTeamTitle.length > 0) {
          // данные изменились, обновляем их на сервере
          var requestUrl = `/teams/${this.team.id}`;
          const payload = new HttpParams()
            .set("newTeamNumber", newTeamNumber)
            .set("newTeamTitle", newTeamTitle);

          this.http.put(requestUrl, payload).subscribe(
            () => {
              this.dialog.close(TeamDetailsComponent.DIALOG_RESULT_ACCEPTED);
            },
            (error) => this.reportServerError(error)
          );
        } else {
          // никаких изменений не было
          // закрываем и не делаем лишнего запроса для обновления данных с сервера
          this.dialog.close(TeamDetailsComponent.DIALOG_RESULT_DECLINED);
        }
      }
    }
  }

  cancelDialog() {
    this.dialog.close(TeamDetailsComponent.DIALOG_RESULT_DECLINED);
  }

  deleteRecord() {
    var confirmationMessage: string = `Удалить команду: '${this.team.title}' (номер: ${this.team.number}) ?`;

    this.confirmationDialog(confirmationMessage, () => {
      // если диалог был принят (accepted)
      const url: string = `/teams/${this.team.id}`;
      this.http.delete(url).subscribe(
        (data: any) => {
          this.dialog.close(TeamDetailsComponent.DIALOG_RESULT_DELETE_ACTION);
        },
        (error) => this.reportServerError(error)
      );
    });
  }

  get modelValidatorService(): TeamValidationService {
    return this._modelValidatorService;
  }

  private getDialogTitle(teamObject?: TeamDataModel): string {
    if (!teamObject) {
      return "Новая команда";
    } else {
      return `Команда №${teamObject.number}`;
    }
  }

  /**
   * Выполняет проверку заполненности полей.
   * @returns true, если поля заполнены, иначе false.
   */
  private validateFields(): boolean {
    this.teamNumberIsIncorrect = !this._modelValidatorService.isTeamNumberCorrect(
      this.team.number
    );

    this.teamTitleIsIncorrect =
      !this.team.title || this.team.title.trim().length == 0;

    return !(this.teamNumberIsIncorrect || this.teamTitleIsIncorrect);
  }
}
