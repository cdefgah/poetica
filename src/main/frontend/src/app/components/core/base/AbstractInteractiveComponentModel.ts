import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { AbstractBareComponent } from './AbstractBareComponent';
import { debugString, debugObject } from 'src/app/utils/Config';

export abstract class AbstractInteractiveComponentModel extends AbstractBareComponent {
  protected abstract getMessageDialogReference(): MatDialog;

  protected reportServerError(error: any, customMessage: string = '') {

    function getServerErrorMessage(errorObject: any) {
      // TODO сделать функцию, которая ищет message в глубину
      // ибо бывают ошибки error.error.error.error.message
      // спросить на SO - как лучше сделать.
      console.log('===========================================');
      console.log('========= SERFVER ERROR OBJECT ============');
      console.log('===========================================');
      console.dir(errorObject);
      console.log('===========================================');

      const rawErrorMessage: string = String(errorObject.message);

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
    messageToDisplay: string,
    messageBoxTitle: string = 'Внимание'
  ): void {
    const msgBoxConfig: MatDialogConfig = MessageBoxComponent.getDialogConfigWithData(
      messageToDisplay,
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
