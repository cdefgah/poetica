import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { HttpClient, HttpParams } from "@angular/common/http";

@Component({
  selector: "app-question-details",
  templateUrl: "./question-details.component.html",
  styleUrls: ["./question-details.component.css"]
})
export class QuestionDetailsComponent implements OnInit {
  constructor(
    private http: HttpClient,
    public dialog: MatDialogRef<QuestionDetailsComponent>
  ) {}

  questionNumber: string = "";
  questionBody: string = "";
  questionSource: string = "";
  questionComment: string = "";

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
      const payload = new HttpParams()
        .set("questionBody", this.questionBody)
        .set("questionSource", this.questionSource)
        .set("questionComment", this.questionComment);

      this.http.post("/questions", payload).subscribe(data => {
        this.serverResponse = data;
        console.log("==== SERVER RESPONSE START ===");
        console.dir(data);
        console.log("==== SERVER RESPONSE END ===");
      });

      this.dialog.close();

      console.log("******************");
      console.log("ACCEPTED");
      console.log("******************");
    }
  }

  cancelDialog() {
    this.dialog.close();
    console.log("******************");
    console.log("CANCELED");
    console.log("******************");
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
