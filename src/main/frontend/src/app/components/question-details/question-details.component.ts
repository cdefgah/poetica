import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-question-details",
  templateUrl: "./question-details.component.html",
  styleUrls: ["./question-details.component.css"]
})
export class QuestionDetailsComponent implements OnInit {
  constructor(public dialog: MatDialogRef<QuestionDetailsComponent>) {}

  questionNumber: string = "";
  questionBody: string = "";
  questionSource: string = "";
  comments: string = "";

  questionBodyIsIncorrect: boolean = false;
  questionSourceIsIncorrect: boolean = false;

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

  private resetValidationFlags() {
    this.questionBodyIsIncorrect = false;
    this.questionSourceIsIncorrect = false;
  }

  /**
   *
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
