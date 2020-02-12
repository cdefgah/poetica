import { Component, OnInit, Inject, Output, EventEmitter } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { HttpClient, HttpParams } from "@angular/common/http";

@Component({
  selector: "app-question-details",
  templateUrl: "./question-details.component.html",
  styleUrls: ["./question-details.component.css"]
})
export class QuestionDetailsComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private http: HttpClient,
    public dialog: MatDialogRef<QuestionDetailsComponent>
  ) {
    this.modelConstraints = dialogData["modelConstraints"];

    var selectedRow = dialogData["selectedRow"];
    if (selectedRow) {
      this.questionId = selectedRow["id"];
      this.questionNumber = selectedRow["number"];
      this.questionBody = selectedRow["body"];
      this.questionSource = selectedRow["source"];
      this.questionComment = selectedRow["comment"];

      this.oldQuestionBody = this.questionBody;
      this.oldQuestionSource = this.questionSource;
      this.oldQuestionComment = this.questionComment;
    }
  }

  modelConstraints: Map<string, number>;

  questionId: number = -1;
  questionNumber: string = "";
  questionBody: string = "";
  questionSource: string = "";
  questionComment: string = "";

  // предварительно сохраняем прежние значения
  // чтобы потом определить, что было изменено.
  oldQuestionBody: string = "";
  oldQuestionSource: string = "";
  oldQuestionComment: string = "";

  questionBodyIsIncorrect: boolean = false;
  questionSourceIsIncorrect: boolean = false;

  serverResponse: any;

  ngOnInit() {}

  generateDialogTitle() {
    if (this.questionNumber.length == 0) {
      return "Новое задание";
    } else {
      return "Задание №" + this.questionNumber;
    }
  }

  acceptDialog() {
    this.resetValidationFlags();
    if (this.validateFields()) {
      if (this.questionNumber.length == 0) {
        // добавляем новую запись
        const payload = new HttpParams()
          .set("questionBody", this.questionBody)
          .set("questionSource", this.questionSource)
          .set("questionComment", this.questionComment);

        this.http.post("/questions", payload).subscribe(data => {
          this.serverResponse = data;
          this.dialog.close(true);
        });
      } else {
        // обновляем существующую запись
        var newQuestionBody: string =
          this.oldQuestionBody != this.questionBody ? this.questionBody : "";

        var newQuestionSource: string =
          this.oldQuestionSource != this.questionSource
            ? this.questionSource
            : "";

        var newQuestionComment: string =
          this.oldQuestionComment != this.questionComment
            ? this.questionComment
            : "";

        var updateComment: boolean =
          this.oldQuestionComment != this.questionComment;

        if (
          newQuestionBody.length > 0 ||
          newQuestionSource.length > 0 ||
          updateComment
        ) {
          // данные изменились, обновляем их на сервере
          var requestUrl = "/questions/" + this.questionId;
          const payload = new HttpParams()
            .set("newQuestionBody", newQuestionBody)
            .set("newQuestionSource", newQuestionSource)
            .set("updateComment", String(updateComment))
            .set("newQuestionComment", newQuestionComment);

          this.http.put(requestUrl, payload).subscribe(() => {
            this.dialog.close(true);
          });
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
    if (this.questionBody.trim().length == 0) {
      this.questionBodyIsIncorrect = true;
    }

    if (this.questionSource.trim().length == 0) {
      this.questionSourceIsIncorrect = true;
    }

    return !(this.questionBodyIsIncorrect || this.questionSourceIsIncorrect);
  }
}
