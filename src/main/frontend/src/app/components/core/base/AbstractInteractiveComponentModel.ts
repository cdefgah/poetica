import { MatDialogConfig, MatDialog } from "@angular/material/dialog";
import { MessageBoxComponent } from "../message-box/message-box.component";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";
import { AbstractBareComponent } from "./AbstractBareComponent";

export abstract class AbstractInteractiveComponentModel extends AbstractBareComponent {
  protected abstract getMessageDialogReference(): MatDialog;

  protected reportServerError(error: any, customMessage: string = "") {
    var customePrefixMessage =
      customMessage && customMessage.length > 0 ? customMessage + ". " : "";
    var errorMessage: string = `${customePrefixMessage}${error.error}. Код статуса сервера: ${error.status}. Сообщение сервера: '${error.message}'`;
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

  protected confirmationDialog(
    confirmationMessage: string,
    dialogAcceptedAction: Function
  ): void {
    var confirmationDialogConfig: MatDialogConfig = ConfirmationDialogComponent.getDialogConfigWithData(
      confirmationMessage
    );

    var confirmationDialogRef = this.getMessageDialogReference().open(
      ConfirmationDialogComponent,
      confirmationDialogConfig
    );

    confirmationDialogRef.afterClosed().subscribe((actionConfirmed) => {
      if (actionConfirmed) {
        dialogAcceptedAction();
      }
    });
  }
}
