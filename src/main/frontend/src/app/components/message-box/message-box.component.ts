import { Component, OnInit, Inject } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogConfig,
  MatDialogRef
} from "@angular/material";

@Component({
  selector: "app-message-box",
  templateUrl: "./message-box.component.html",
  styleUrls: ["./message-box.component.css"]
})
export class MessageBoxComponent implements OnInit {
  private static readonly KEY_DIALOG_TITLE = "dialogTitle";
  private static readonly KEY_DIALOG_MESSAGE = "dialogMessage";
  private static readonly KEY_ACCEPT_BUTTON_TITLE = "acceptButtonTitle";

  static getDialogConfigWithData(
    dialogMessage: string,
    dialogTitle?: string,
    acceptButtonTitle?: string
  ): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "50%";

    dialogConfig.data = new Map<string, string>();

    dialogConfig.data[MessageBoxComponent.KEY_DIALOG_MESSAGE] = dialogMessage;

    if (dialogTitle) {
      dialogConfig.data[MessageBoxComponent.KEY_DIALOG_TITLE] = dialogTitle;
    }

    if (acceptButtonTitle) {
      dialogConfig.data[
        MessageBoxComponent.KEY_ACCEPT_BUTTON_TITLE
      ] = acceptButtonTitle;
    }

    return dialogConfig;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialog: MatDialogRef<MessageBoxComponent>
  ) {
    if (!dialogData) {
      return;
    }

    var passedValue: string = this.getMapValue(
      MessageBoxComponent.KEY_DIALOG_TITLE,
      dialogData
    );
    if (passedValue.length > 0) {
      this.dialogTitle = passedValue;
    }

    passedValue = this.getMapValue(
      MessageBoxComponent.KEY_DIALOG_MESSAGE,
      dialogData
    );
    if (passedValue.length > 0) {
      this.dialogMessage = passedValue;
    }

    passedValue = this.getMapValue(
      MessageBoxComponent.KEY_ACCEPT_BUTTON_TITLE,
      dialogData
    );
    if (passedValue.length > 0) {
      this.acceptButtonTitle = passedValue;
    }
  }

  getMapValue(mapKey: string, map: Map<string, string>): string {
    if (mapKey in map && map[mapKey]) {
      return map[mapKey];
    } else {
      return "";
    }
  }

  dialogTitle: string = "Сообщение";
  dialogMessage: string =
    "Если вы видите этот текст, значит объект MessageBoxComponent был некорректно проинициализирован.";
  acceptButtonTitle: string = "Ok";

  ngOnInit(): void {}

  getDialogTitle() {
    return this.dialogTitle;
  }

  getMessage() {
    return this.dialogMessage;
  }

  acceptDialog() {
    this.dialog.close(true);
  }

  getAcceptButtonTitle() {
    return this.acceptButtonTitle;
  }
}
