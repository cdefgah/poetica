import { Component, OnInit, Inject, Output, EventEmitter } from "@angular/core";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogConfig,
  MatDialog
} from "@angular/material/dialog";
import { HttpClient, HttpParams } from "@angular/common/http";
import { MessageBoxComponent } from "../message-box/message-box.component";
import { Question } from "src/app/model/Question";

@Component({
  selector: "app-question-details",
  templateUrl: "./question-details.component.html",
  styleUrls: ["./question-details.component.css"]
})
export class QuestionDetailsComponent implements OnInit {
  private static readonly KEY_DIALOG_ID = "id";
  private static readonly KEY_DIALOG_MODEL_CONSTRAINTS = "modelConstraints";

  dialogTitle: string;

  question: Question;
  questionCopy: Question; // используется для сравнения, были-ли изменения при редактировании

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private http: HttpClient,
    public dialog: MatDialogRef<QuestionDetailsComponent>,
    public otherDialog: MatDialog
  ) {
    this.question = new Question();

    console.log("*** Loading dialog config ****** START");
    this.modelConstraints =
      dialogData[QuestionDetailsComponent.KEY_DIALOG_MODEL_CONSTRAINTS];

    var questionId = dialogData[QuestionDetailsComponent.KEY_DIALOG_ID];

    if (questionId) {
      // редактируем существующее задание
      var url: string = "/questions/" + questionId;

      console.log("******** calling the server ");
      this.http.get(url).subscribe(
        (data: Map<string, any>) => {
          console.log("url request succeed: " + url);
          console.log("********** data info *****************");
          console.dir(data);
          console.log("**************************************");

          console.log("********** question init *************");
          this.question = new Question(data);
          console.dir(this.question);
          console.log("**************************************");

          console.log("********** question copy init *************");
          this.questionCopy = new Question(data);
          console.dir(this.questionCopy);
          console.log("**************************************");

          this.dialogTitle = this.getDialogTitle(this.question);
        },
        error => this.displayErrorMessage(error)
      );
    } else {
      // создаём новое задание
      this.question = new Question();
      this.dialogTitle = this.getDialogTitle(this.question);
    }
  }

  static getDialogConfigWithData(
    modelConstraints: Map<string, number>,
    row?: any
  ): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "50%";

    dialogConfig.data = new Map<string, any>();

    dialogConfig.data[
      QuestionDetailsComponent.KEY_DIALOG_MODEL_CONSTRAINTS
    ] = modelConstraints;

    console.log("**** Selected row ****");
    console.dir(row);
    console.log("**************************");

    if (row) {
      dialogConfig.data[QuestionDetailsComponent.KEY_DIALOG_ID] =
        row[QuestionDetailsComponent.KEY_DIALOG_ID];
    }

    console.log("**** DIALOG CONFIG ****");
    console.dir(dialogConfig);
    console.log("**************************");

    return dialogConfig;
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

  modelConstraints: Map<string, number>;

  questionBodyIsIncorrect: boolean = false;
  questionSourceIsIncorrect: boolean = false;

  serverResponse: any;

  ngOnInit() {}

  private getDialogTitle(questionObject: Question): string {
    if (questionObject.number === 0) {
      return "Новое задание";
    } else {
      var isCreditedString = questionObject.credited
        ? " (Зачётное)"
        : " (Внезачётное)";

      return "Задание №" + String(questionObject.number) + isCreditedString;
    }
  }

  acceptDialog() {
    this.resetValidationFlags();
    if (this.validateFields()) {
      if (this.question.number === 0) {
        // добавляем новую запись
        const payload = new HttpParams()
          .set("questionBody", this.question.body)
          .set("questionSource", this.question.source)
          .set("questionComment", this.question.comment);

        this.http.post("/questions", payload).subscribe(
          data => {
            this.serverResponse = data;
            this.dialog.close(true);
          },
          error => this.displayErrorMessage(error)
        );
      } else {
        // обновляем существующую запись
        var newQuestionBody: string =
          this.questionCopy.body != this.question.body
            ? this.question.body
            : "";

        var newQuestionSource: string =
          this.questionCopy.source != this.question.source
            ? this.question.source
            : "";

        var newQuestionComment: string =
          this.questionCopy.comment != this.question.comment
            ? this.question.comment
            : "";

        var updateComment: boolean =
          this.questionCopy.comment != this.question.comment;

        if (
          newQuestionBody.length > 0 ||
          newQuestionSource.length > 0 ||
          updateComment
        ) {
          // данные изменились, обновляем их на сервере
          var requestUrl = "/questions/" + this.question.id;
          const payload = new HttpParams()
            .set("newQuestionBody", newQuestionBody)
            .set("newQuestionSource", newQuestionSource)
            .set("updateComment", String(updateComment))
            .set("newQuestionComment", newQuestionComment);

          this.http.put(requestUrl, payload).subscribe(
            () => {
              this.dialog.close(true);
            },
            error => this.displayErrorMessage(error)
          );
        } else {
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

  /**
   * Выполняет сброс флагов валидации,
   * чтобы не подсвечивались подписи для незаполненных полей.
   */
  private resetValidationFlags() {
    this.questionBodyIsIncorrect = false;
    this.questionSourceIsIncorrect = false;
  }

  /**
   * Выполняет проверку заполненности полей.
   * @returns true, если поля заполнены, иначе false.
   */
  private validateFields(): boolean {
    if (this.question.body.trim().length == 0) {
      this.questionBodyIsIncorrect = true;
    }

    if (this.question.source.trim().length == 0) {
      this.questionSourceIsIncorrect = true;
    }

    return !(this.questionBodyIsIncorrect || this.questionSourceIsIncorrect);
  }
}
