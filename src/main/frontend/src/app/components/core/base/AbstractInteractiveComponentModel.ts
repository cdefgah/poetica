import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { AbstractBareComponent } from './AbstractBareComponent';
import { debugString, debugObject } from 'src/app/utils/Config';

export abstract class AbstractInteractiveComponentModel extends AbstractBareComponent {
  protected abstract getMessageDialogReference(): MatDialog;

  protected reportServerError(error: any, customMessage: string = '') {
    console.log("=====================================================");
    console.log("error object is below");
    console.dir(error);
    console.log("=====================================================");

    function getServerErrorMessage(errorObject: any) {
      let rawErrorMessage: string;
      if (errorObject.hasOwnProperty('error')) {
        if (errorObject.error.hasOwnProperty('message')) {
          rawErrorMessage = errorObject.error.message;
        } else {
          rawErrorMessage = errorObject.error;
        }

      } else {
        rawErrorMessage = errorObject.toString();
      }

      console.log("raw error message is below");
      console.log(rawErrorMessage);
      console.dir(rawErrorMessage);
      console.log("============================");

      // TODO переделать на пристойный механизм обработки ошибок, а это это какая-то печаль и непристойность
      const prefixToCheck = 'Внимание: '; // наличие этого префикса говорит о том, что ошибка штатная (не катастрофа).

      if (rawErrorMessage.startsWith(prefixToCheck)) {
        // ошибка штатная, не надо включать код ответа сервера и прочую техническую информацию
        // Вырезаем строку префикса, она не нужна.
        return rawErrorMessage.substring(prefixToCheck.length);
      } else {
        // ошибка нештатная, что-то сломалось, включаем код ответа сервера и прочую техническую информацию
        return `${rawErrorMessage}. Код статуса сервера: ${errorObject.status}. Сообщение сервера: '${errorObject.message}'`;
      }
    }

    const customePrefixMessage =
      customMessage && customMessage.length > 0 ? customMessage + '. ' : '';
    const errorMessage = `${customePrefixMessage}${getServerErrorMessage(
      error
    )}.`;
    this.displayMessage(errorMessage);
  }

  protected displayMessage(
    errorMessage: string,
    messageBoxTitle: string = 'Внимание'
  ): void {
    const msgBoxConfig: MatDialogConfig = MessageBoxComponent.getDialogConfigWithData(
      errorMessage,
      messageBoxTitle
    );

    this.getMessageDialogReference().open(MessageBoxComponent, msgBoxConfig);
  }

  protected confirmationDialog(
    confirmationMessage: string,
    dialogAcceptedAction: Function
  ): void {
    const confirmationDialogConfig: MatDialogConfig = ConfirmationDialogComponent.getDialogConfigWithData(
      confirmationMessage
    );

    const confirmationDialogRef = this.getMessageDialogReference().open(
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
