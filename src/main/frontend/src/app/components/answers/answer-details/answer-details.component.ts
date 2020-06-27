import { Component, OnInit, Inject } from "@angular/core";
import { AbstractInteractiveComponentModel } from "src/app/components/core/base/AbstractInteractiveComponentModel";
import {
  MatDialog,
  MatDialogConfig,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material";
import { debugString } from "src/app/utils/Config";
import { HttpClient } from "@angular/common/http";
import { AnswerDataModel } from "src/app/model/AnswerDataModel";
import { EmailDataModel } from "src/app/model/EmailDataModel";
import { TeamDataModel } from "src/app/model/TeamDataModel";
import { QuestionDataModel } from "src/app/model/QuestionDataModel";

@Component({
  selector: "app-answer-details",
  templateUrl: "./answer-details.component.html",
  styleUrls: ["./answer-details.component.css"],
})
export class AnswerDetailsComponent extends AbstractInteractiveComponentModel
  implements OnInit {
  private static readonly KEY_DIALOG_ID = "id";

  public static readonly DIALOG_GRADE_SET: number = 1;

  // инициализация пустыми объектами, чтобы связанные со свойствами этих объектов компоненты отрисовались корректно
  answer: AnswerDataModel = AnswerDataModel.emptyAnswer;
  email: EmailDataModel = EmailDataModel.emptyEmail;
  team: TeamDataModel = TeamDataModel.emptyTeam;
  question: QuestionDataModel = QuestionDataModel.emptyQuestion;

  static getDialogConfigWithData(row: any): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "75%";

    dialogConfig.data = new Map<string, any>();

    debugString("Checking the row validity");
    debugString(row);
    if (row) {
      debugString("Checking the row validity ... row is defined!");

      // идентификатор ответа (из строки списка ответов)
      dialogConfig.data[AnswerDetailsComponent.KEY_DIALOG_ID] =
        row[AnswerDetailsComponent.KEY_DIALOG_ID];
    } else {
      debugString("Checking the row validity - ROW IS UNDEFINED!");
    }

    return dialogConfig;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private httpClient: HttpClient,
    public dialog: MatDialogRef<AnswerDetailsComponent>,
    public otherDialog: MatDialog
  ) {
    super();

    var answerId = dialogData[AnswerDetailsComponent.KEY_DIALOG_ID];

    // получаем объект answer
    const answerDetailsUrl: string = `/answers/${answerId}`;
    this.httpClient.get(answerDetailsUrl).subscribe(
      (answerDetailsData: Map<string, any>) => {
        this.answer = AnswerDataModel.createAnswerFromMapOfValues(
          answerDetailsData
        );

        // получаем объект email
        const emailRequestUrl: string = `/emails/${this.answer.emailId}`;
        this.httpClient.get(emailRequestUrl).subscribe(
          (emailDetailsData: Map<string, any>) => {
            // получили
          },
          (error) => this.reportServerError(error)
        );
      },
      (error) => this.reportServerError(error)
    );
  }

  ngOnInit(): void {}

  protected getMessageDialogReference(): MatDialog {
    return this.otherDialog;
  }

  acceptAnswer() {
    debugString("Answer has accepted");
    this.dialog.close(AnswerDetailsComponent.DIALOG_GRADE_SET);
  }

  declineAnswer() {
    debugString("Answer has not accepted");
    this.dialog.close(AnswerDetailsComponent.DIALOG_GRADE_SET);
  }

  justCloseDialog() {
    debugString("Just closing dialog without affecting answer");
    this.dialog.close();
  }
}
