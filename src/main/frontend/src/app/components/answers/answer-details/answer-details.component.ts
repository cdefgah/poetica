import { Component, OnInit, Inject } from "@angular/core";
import { AbstractInteractiveComponentModel } from "src/app/components/core/base/AbstractInteractiveComponentModel";
import {
  MatDialog,
  MatDialogConfig,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material";
import { debugString, debugObject } from "src/app/utils/Config";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AnswerDataModel } from "src/app/data-model/AnswerDataModel";
import { EmailDataModel } from "src/app/data-model/EmailDataModel";
import { TeamDataModel } from "src/app/data-model/TeamDataModel";
import { QuestionDataModel } from "src/app/data-model/QuestionDataModel";

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

    debugString("Loading answerId in the dialog ...");
    var answerId = dialogData[AnswerDetailsComponent.KEY_DIALOG_ID];

    debugString(`answerId = ${this.answer.id}`);
    debugString("dialogData is below:");
    debugObject(dialogData);

    // получаем объект answer
    const answerDetailsUrl: string = `/answers/${answerId}`;
    this.httpClient.get(answerDetailsUrl).subscribe(
      (answerDetailsData: Map<string, any>) => {
        // получили, строим объект
        this.answer = AnswerDataModel.createAnswerFromMap(answerDetailsData);

        // получаем объект email
        const emailRequestUrl: string = `/emails/${this.answer.emailId}`;
        this.httpClient.get(emailRequestUrl).subscribe(
          (emailDetailsData: Map<string, any>) => {
            // получили, строим объект
            this.email = EmailDataModel.createEmailFromMap(emailDetailsData);

            // получаем объект question
            const questionRequestUrl: string = `/questions/${this.answer.questionId}`;
            this.httpClient.get(questionRequestUrl).subscribe(
              (questionDetailData: Map<string, any>) => {
                // получили, строим объект
                this.question = QuestionDataModel.createQuestionFromMap(
                  questionDetailData
                );

                // получаем объект team
                const teamRequestUrl: string = `/teams/${this.answer.teamId}`;
                this.httpClient.get(teamRequestUrl).subscribe(
                  (teamDetailsData: Map<string, any>) => {
                    // получили, строим объект
                    this.team = TeamDataModel.createTeamFromMap(
                      teamDetailsData
                    );
                  },
                  (error) => this.reportServerError(error)
                );
              },
              (error) => this.reportServerError(error)
            );
          },
          (error) => this.reportServerError(error)
        );
      },
      (error) => this.reportServerError(error)
    );
  }

  ngOnInit(): void {}

  get dialogTitle(): string {
    return `Ответ (${this.answer.answerGrade2Display})`;
  }

  protected getMessageDialogReference(): MatDialog {
    return this.otherDialog;
  }

  acceptAnswer() {
    this.confirmationDialog("Принять ответ?", () => {
      debugString("Answer has accepted");
      var requestUrl = "/answers/accept";
      const payload = new HttpParams().set(
        "answerId",
        this.answer.id.toString()
      );

      this.httpClient.put(requestUrl, payload).subscribe(
        () => {
          debugString("Answer has accepted ... request done successfully");
          this.dialog.close(AnswerDetailsComponent.DIALOG_GRADE_SET);
        },
        (error) => this.reportServerError(error)
      );
    });
  }

  declineAnswer() {
    this.confirmationDialog("Отклонить ответ?", () => {
      debugString("Answer has declined");
      var requestUrl = "/answers/decline";
      const payload = new HttpParams().set(
        "answerId",
        this.answer.id.toString()
      );

      this.httpClient.put(requestUrl, payload).subscribe(
        () => {
          debugString("Answer has declined ... request done successfully");
          this.dialog.close(AnswerDetailsComponent.DIALOG_GRADE_SET);
        },
        (error) => this.reportServerError(error)
      );
    });
  }

  justCloseDialog() {
    debugString("Just closing dialog without affecting answer");
    this.dialog.close();
  }
}
