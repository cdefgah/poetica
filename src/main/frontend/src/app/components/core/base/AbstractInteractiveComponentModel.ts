import { MatDialogConfig, MatDialog } from "@angular/material/dialog";
import { MessageBoxComponent } from "../message-box/message-box.component";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";
import { AbstractBareComponent } from "./AbstractBareComponent";
import { debugString, debugObject } from "src/app/utils/Config";

export abstract class AbstractInteractiveComponentModel extends AbstractBareComponent {
  protected abstract getMessageDialogReference(): MatDialog;

  protected reportServerError(error: any, customMessage: string = "") {
    function getServerErrorMessage(errorObject: any) {
      var rawErrorMessage: string;
      if (errorObject.hasOwnProperty("error")) {
        rawErrorMessage = errorObject.error.message;
      } else {
        rawErrorMessage = errorObject.toString();
      }

      // TODO переделать на пристойный механизм обработки ошибок, а это это какая-то печаль и непристойность
      const prefixToCheck = "Внимание: "; // наличие этого префикса говорит о том, что ошибка штатная (не катастрофа).

      if (rawErrorMessage.startsWith(prefixToCheck)) {
        // ошибка штатная, не надо включать код ответа сервера и прочую техническую информацию
        // Вырезаем строку префикса, она не нужна.
        return rawErrorMessage.substring(prefixToCheck.length);
      } else {
        // ошибка нештатная, что-то сломалось, включаем код ответа сервера и прочую техническую информацию
        return `${rawErrorMessage}. Код статуса сервера: ${errorObject.status}. Сообщение сервера: '${errorObject.message}'`;
      }
    }

    var customePrefixMessage =
      customMessage && customMessage.length > 0 ? customMessage + ". " : "";
    var errorMessage: string = `${customePrefixMessage}${getServerErrorMessage(
      error
    )}.`;
    this.displayMessage(errorMessage);
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
