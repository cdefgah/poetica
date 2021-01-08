/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { Component, OnInit, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material';
import { AbstractBareComponent } from '../base/AbstractBareComponent';

@Component({
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.css'],
})
export class MessageBoxComponent extends AbstractBareComponent
  implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialog: MatDialogRef<MessageBoxComponent>
  ) {
    super();
    if (!dialogData) {
      return;
    }

    let passedValue: string = this.getMapValue(
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
  private static readonly KEY_DIALOG_TITLE = 'dialogTitle';
  private static readonly KEY_DIALOG_MESSAGE = 'dialogMessage';
  private static readonly KEY_ACCEPT_BUTTON_TITLE = 'acceptButtonTitle';

  dialogTitle = 'Сообщение';
  dialogMessage =
    'Если вы видите этот текст, значит объект MessageBoxComponent был некорректно проинициализирован.';
  acceptButtonTitle = 'Ok';

  static getDialogConfigWithData(
    dialogMessage: string,
    dialogTitle?: string,
    acceptButtonTitle?: string
  ): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '38%';

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

  ngOnInit(): void { }

  acceptDialog() {
    this.dialog.close(true);
  }
}
