import { Component, OnInit, Inject } from "@angular/core";
import {
  MatDialogConfig,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";

@Component({
  selector: "app-confirmation-dialog",
  templateUrl: "./confirmation-dialog.component.html",
  styleUrls: ["./confirmation-dialog.component.css"],
})
export class ConfirmationDialogComponent implements OnInit {
  private static readonly KEY_DIALOG_TITLE = "dialogTitle";
  private static readonly KEY_DIALOG_CONFIRMATION_MESSAGE =
    "dialogConfirmationMessage";
  private static readonly KEY_CONFIRM_BUTTON_TITLE = "confirmButtonTitle";
  private static readonly KEY_DECLINE_BUTTON_TITLE = "declineButtonTitle";

  static getDialogConfigWithData(
    dialogMessage: string,
    dialogTitle?: string,
    confirmButtonTitle?: string,
    declineButtonTitle?: string
  ): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "19%";

    dialogConfig.data = new Map<string, string>();

    dialogConfig.data[
      ConfirmationDialogComponent.KEY_DIALOG_CONFIRMATION_MESSAGE
    ] = dialogMessage;

    if (dialogTitle) {
      dialogConfig.data[
        ConfirmationDialogComponent.KEY_DIALOG_TITLE
      ] = dialogTitle;
    }

    if (confirmButtonTitle) {
      dialogConfig.data[
        ConfirmationDialogComponent.KEY_CONFIRM_BUTTON_TITLE
      ] = confirmButtonTitle;
    }

    if (declineButtonTitle) {
      dialogConfig.data[
        ConfirmationDialogComponent.KEY_DECLINE_BUTTON_TITLE
      ] = declineButtonTitle;
    }

    return dialogConfig;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialog: MatDialogRef<ConfirmationDialogComponent>
  ) {
    if (!dialogData) {
      return;
    }

    var passedValue: string = this.getMapValue(
      ConfirmationDialogComponent.KEY_DIALOG_TITLE,
      dialogData
    );
    if (passedValue.length > 0) {
      this.dialogTitle = passedValue;
    }

    passedValue = this.getMapValue(
      ConfirmationDialogComponent.KEY_DIALOG_CONFIRMATION_MESSAGE,
      dialogData
    );
    if (passedValue.length > 0) {
      this.confirmationMessage = passedValue;
    }

    passedValue = this.getMapValue(
      ConfirmationDialogComponent.KEY_CONFIRM_BUTTON_TITLE,
      dialogData
    );
    if (passedValue.length > 0) {
      this.confirmButtonTitle = passedValue;
    }

    passedValue = this.getMapValue(
      ConfirmationDialogComponent.KEY_DECLINE_BUTTON_TITLE,
      dialogData
    );
    if (passedValue.length > 0) {
      this.declineButtonTitle = passedValue;
    }
  }

  getMapValue(mapKey: string, map: Map<string, string>): string {
    if (mapKey in map && map[mapKey]) {
      return map[mapKey];
    } else {
      return "";
    }
  }

  dialogTitle: string = "Подтверждение";
  confirmationMessage: string =
    "Если вы видите этот текст, значит объект ConfirmationDialogComponent был некорректно проинициализирован.";
  confirmButtonTitle: string = "Да";
  declineButtonTitle: string = "Нет";

  ngOnInit(): void {}

  confirmAction() {
    this.dialog.close(true);
  }

  declineAction() {
    this.dialog.close(false);
  }
}
