import { MatDialogConfig, MatDialog } from "@angular/material/dialog";
import { MessageBoxComponent } from "../components/message-box/message-box.component";

export abstract class AbstractInteractiveComponentModel {
  protected abstract getMessageDialogReference(): MatDialog;

  protected reportServerError(error: any, customMessage: string = "") {
    var errorMessage: string = `${customMessage}. ${error.error}. Код статуса: ${error.status}. Сообщение сервера: '${error.message}'`;
    this.displayMessage(errorMessage);
  }

  protected reportGeneralError(error: Error): void {
    this.displayMessage(error.message);
  }

  protected displayMessage(
    errorMessage: string,
    messageBoxTitle: string = "Внимание"
  ): void {
    var msgBoxConfig: MatDialogConfig = MessageBoxComponent.getDialogConfigWithData(
      errorMessage,
      messageBoxTitle
    );

    this.getMessageDialogReference().open(MessageBoxComponent, msgBoxConfig);
  }
}
