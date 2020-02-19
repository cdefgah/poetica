import { Component, OnInit, Inject } from "@angular/core";
import { Team } from "src/app/model/Team";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
  MatDialogConfig
} from "@angular/material";
import { HttpClient, HttpParams } from "@angular/common/http";
import { MessageBoxComponent } from "../message-box/message-box.component";

@Component({
  selector: "app-team-details",
  templateUrl: "./team-details.component.html",
  styleUrls: ["./team-details.component.css"]
})
export class TeamDetailsComponent implements OnInit {
  private static readonly KEY_DIALOG_ID = "id";
  private static readonly KEY_DIALOG_MODEL_CONSTRAINTS = "modelConstraints";

  dialogTitle: string;

  team: Team;
  teamCopy: Team;

  teamNumberIsIncorrect: boolean = false;
  teamTitleIsIncorrect: boolean = false;

  modelConstraints: Map<string, string>;

  serverResponse: any;

  static getDialogConfigWithData(
    modelConstraints: Map<string, string>,
    row?: any
  ): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "38%";

    dialogConfig.data = new Map<string, any>();

    dialogConfig.data[
      TeamDetailsComponent.KEY_DIALOG_MODEL_CONSTRAINTS
    ] = modelConstraints;

    if (row) {
      dialogConfig.data[TeamDetailsComponent.KEY_DIALOG_ID] =
        row[TeamDetailsComponent.KEY_DIALOG_ID];
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
    // создаём объект team сразу первой строчкой
    // так как к нему подключены (bind)
    // свойства в html-template комепонента
    // и если не проинициализировать объект сразу
    // то компонент может попытаться (асинхронно) получить свойство
    // объекта, который мы ещё не проинициализировали,
    // например в случаях, когда get запрос ещё не закончил выполняться
    this.team = new Team();

    this.modelConstraints =
      dialogData[TeamDetailsComponent.KEY_DIALOG_MODEL_CONSTRAINTS];

    var teamId = dialogData[TeamDetailsComponent.KEY_DIALOG_ID];

    if (teamId) {
      // редактируем существующее задание
      var url: string = "/teams/" + teamId;
      this.http.get(url).subscribe(
        (data: Map<string, any>) => {
          this.team.initialize(data);

          this.teamCopy = new Team();
          this.teamCopy.initialize(data);

          this.dialogTitle = this.getDialogTitle(this.team);
        },
        error => this.displayErrorMessage(error)
      );
    } else {
      // создаём заголовок диалога для новой команды
      this.dialogTitle = this.getDialogTitle();
    }
  }

  ngOnInit(): void {}

  acceptDialog() {
    console.log("ACCEPT START ***");

    this.resetValidationFlags();
    if (this.validateFields()) {
      console.log("VALIDATED");
      console.log("this.team.id = " + this.team.id);

      if (!this.team.id) {
        console.log("ADD NEW RECORD");

        // добавляем новую запись
        const payload = new HttpParams()
          .set("teamNumber", this.team.number)
          .set("teamTitle", this.team.title);

        this.http.post("/teams", payload).subscribe(
          data => {
            this.serverResponse = data;
            this.dialog.close(true);
          },
          error => this.displayErrorMessage(error)
        );
      } else {
        console.log("UPDATE RECORD");

        // обновляем существующую запись
        var newTeamNumber: string =
          this.team.number != this.teamCopy.number ? this.team.number : "";

        console.log("newTeamNumber = " + newTeamNumber);
        console.log("newTeamNumber.length = " + newTeamNumber.length);

        var newTeamTitle: string =
          this.team.title != this.teamCopy.title ? this.team.title : "";

        console.log("newTeamTitle = " + newTeamTitle);
        console.log("newTeamTitle.length = " + newTeamTitle.length);

        console.log("HAS DATA CHANGED? ");
        if (newTeamNumber.length > 0 || newTeamTitle.length > 0) {
          console.log("DATA HAS CHANGED!");

          // данные изменились, обновляем их на сервере
          var requestUrl = "/teams/" + this.team.id;
          const payload = new HttpParams()
            .set("newTeamNumber", newTeamNumber)
            .set("newTeamTitle", newTeamTitle);

          this.http.put(requestUrl, payload).subscribe(
            () => {
              console.log("PUT REQUEST DONEH!");
              this.dialog.close(true);
            },
            error => this.displayErrorMessage(error)
          );
        } else {
          console.log("DATA HAS NOT NOT NOOOOOOOOT CHANGED!");

          // никаких изменений не было
          // закрываем и не делаем лишнего запроса для обновления данных с сервера
          this.dialog.close(false);
        }
      }
    }
  }

  cancelDialog() {
    this.dialog.close(false);
  }

  private getDialogTitle(teamObject?: Team): string {
    if (!teamObject) {
      return "Новая команда";
    } else {
      return "Команда №" + teamObject.number;
    }
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

    this.otherDialog.open(MessageBoxComponent, msgBoxConfig);
  }

  /**
   * Выполняет проверку заполненности полей.
   * @returns true, если поля заполнены, иначе false.
   */
  private validateFields(): boolean {
    if (!Team.numberRegExValidator.test(this.team.number)) {
      this.teamNumberIsIncorrect = true;
    }

    if (this.team.title.trim().length == 0) {
      this.teamTitleIsIncorrect = true;
    }

    return !(this.teamNumberIsIncorrect || this.teamTitleIsIncorrect);
  }
}
