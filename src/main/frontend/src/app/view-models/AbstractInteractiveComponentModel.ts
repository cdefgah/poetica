import { MatDialogConfig, MatDialog } from "@angular/material/dialog";
import { MessageBoxComponent } from "../components/message-box/message-box.component";

export abstract class AbstractInteractiveComponentModel {
  protected abstract getMessageDialogReference(): MatDialog;

  protected reportServerError(error: any) {
    var errorMessage: string = `${error.error}. Код статуса: ${error.status}. Сообщение сервера: '${error.message}'`;
    this.displayErrorMessage(errorMessage);
  }

  protected reportGeneralError(error: Error): void {
    this.displayErrorMessage(error.message);
  }

  protected displayErrorMessage(
    errorMessage: string,
    messageBoxTitle: string = "Ошибка"
  ): void {
    var msgBoxConfig: MatDialogConfig = MessageBoxComponent.getDialogConfigWithData(
      errorMessage,
      messageBoxTitle
    );

    this.getMessageDialogReference().open(MessageBoxComponent, msgBoxConfig);
  }
}
