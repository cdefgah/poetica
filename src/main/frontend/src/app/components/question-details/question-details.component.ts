import { Component, OnInit, Inject, Output, EventEmitter } from "@angular/core";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogConfig,
  MatDialog,
} from "@angular/material/dialog";
import { HttpClient, HttpParams } from "@angular/common/http";
import { MessageBoxComponent } from "../message-box/message-box.component";
import { Question } from "src/app/model/Question";

@Component({
  selector: "app-question-details",
  templateUrl: "./question-details.component.html",
  styleUrls: ["./question-details.component.css"],
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
    // создаём объект question сразу первой строчкой
    // так как к нему подключены (bind)
    // свойства в html-template комепонента
    // и если не проинициализировать объект сразу
    // то компонент может попытаться (асинхронно) получить свойство
    // объекта, который мы ещё не проинициализировали,
    // например в случаях, когда get запрос ещё не закончил выполняться
    this.question = new Question();

    this.modelConstraints =
      dialogData[QuestionDetailsComponent.KEY_DIALOG_MODEL_CONSTRAINTS];

    var questionId = dialogData[QuestionDetailsComponent.KEY_DIALOG_ID];

    if (questionId) {
      // редактируем существующее задание
      var url: string = "/questions/" + questionId;
      this.http.get(url).subscribe(
        (data: Map<string, any>) => {
          this.question.initialize(data);

          this.questionCopy = new Question();
          this.questionCopy.initialize(data);

          this.dialogTitle = this.getDialogTitle(this.question);
        },
        (error) => this.displayErrorMessage(error)
      );
    } else {
      // создаём заголовок диалога для нового задания
      this.dialogTitle = this.getDialogTitle(this.question);
    }
  }

  static getDialogConfigWithData(
    modelConstraints: Map<string, string>,
    row?: any
  ): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "62%";

    dialogConfig.data = new Map<string, any>();

    dialogConfig.data[
      QuestionDetailsComponent.KEY_DIALOG_MODEL_CONSTRAINTS
    ] = modelConstraints;

    if (row) {
      dialogConfig.data[QuestionDetailsComponent.KEY_DIALOG_ID] =
        row[QuestionDetailsComponent.KEY_DIALOG_ID];
    }

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
      var isGradedString = questionObject.graded
        ? " (Зачётное)"
        : " (Внезачётное)";

      return "Задание №" + String(questionObject.number) + isGradedString;
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
          (data) => {
            this.serverResponse = data;
            this.dialog.close(true);
          },
          (error) => this.displayErrorMessage(error)
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
            (error) => this.displayErrorMessage(error)
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
