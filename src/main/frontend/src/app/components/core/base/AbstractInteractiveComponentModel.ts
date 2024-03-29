/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { AbstractBareComponent } from './AbstractBareComponent';
import { PoeticaLogger } from '../../../utils/PoeticaLogger';

export abstract class AbstractInteractiveComponentModel extends AbstractBareComponent {
  protected abstract getMessageDialogReference(): MatDialog;

  protected reportServerError(error: any, customMessage: string = '') {

    function getServerErrorMessage(errorObject: any) {
      // TODO сделать функцию, которая ищет message в глубину
      // ибо бывают ошибки error.error.error.error.message
      // спросить на SO - как лучше сделать.

      PoeticaLogger.logObjectState(errorObject, 'Server error object');

      const rawErrorMessage: string = errorObject.error !== undefined ? String(errorObject.error) : String(errorObject.message);

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

    const customePrefixMessage = customMessage && customMessage.length > 0 ? customMessage + '. ' : '';
    const errorMessage = `${customePrefixMessage}${getServerErrorMessage(error)}.`;
    this.displayMessage(errorMessage);
  }

  protected displayMessage(messageToDisplay: string, messageBoxTitle: string = 'Внимание'): void {

    const msgBoxConfig: MatDialogConfig = MessageBoxComponent.getDialogConfigWithData(messageToDisplay, messageBoxTitle);
    this.getMessageDialogReference().open(MessageBoxComponent, msgBoxConfig);
  }

  protected confirmationDialog(confirmationMessage: string, dialogAcceptedAction: Function): void {

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
