import { MatDialogConfig, MatDialog } from "@angular/material/dialog";
import { MessageBoxComponent } from "../components/message-box/message-box.component";

export abstract class AbstractComponentModel {
  protected abstract getMessageDialogReference(): MatDialog;

  protected reportException(error: Error): void {
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
