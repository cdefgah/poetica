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

@Component({
  selector: "app-answer-details",
  templateUrl: "./answer-details.component.html",
  styleUrls: ["./answer-details.component.css"],
})
export class AnswerDetailsComponent extends AbstractInteractiveComponentModel
  implements OnInit {
  private static readonly KEY_DIALOG_ID = "id";

  public static readonly DIALOG_GRADE_SET: number = 1;

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
