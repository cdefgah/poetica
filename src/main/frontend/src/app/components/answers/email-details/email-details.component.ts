/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialogConfig,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AbstractInteractiveComponentModel } from '../../core/base/AbstractInteractiveComponentModel';
import { EmailDataModel } from '../../../data-model/EmailDataModel';

@Component({
  selector: 'app-email-details',
  templateUrl: './email-details.component.html',
  styleUrls: ['./email-details.component.css'],
})
export class EmailDetailsComponent extends AbstractInteractiveComponentModel
  implements OnInit {
  private static readonly KEY_DIALOG_ID = 'id';

  email: EmailDataModel = EmailDataModel.emptyEmail;

  static getDialogConfigWithData(row: any): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '62%';

    dialogConfig.data = new Map<string, any>();

    if (row) {
      // идентификатор письма (из строки списка с письмами)
      dialogConfig.data[EmailDetailsComponent.KEY_DIALOG_ID] =
        row[EmailDetailsComponent.KEY_DIALOG_ID];
    }

    return dialogConfig;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private httpClient: HttpClient,
    public dialog: MatDialogRef<EmailDetailsComponent>,
    public otherDialog: MatDialog
  ) {
    super();

    const emailId = dialogData[EmailDetailsComponent.KEY_DIALOG_ID];

    // получаем объект email
    const emailRequestUrl = `/emails/${emailId}`;
    this.httpClient.get(emailRequestUrl).subscribe(
      (emailDetailsData: Map<string, any>) => {
        // получили, строим объект
        this.email = EmailDataModel.createEmailFromMap(emailDetailsData);
      },
      (error) => this.reportServerError(error)
    );
  }

  ngOnInit(): void { }

  protected getMessageDialogReference(): MatDialog {
    return this.otherDialog;
  }

  deleteEmailWithAllImportedAnswers() {
    const confirmationMessage = `Удалить это письмо и все импортированные из него ответы ?`;

    this.confirmationDialog(confirmationMessage, () => {
      // если диалог был принят (accepted)
      const requestUrl = `/emails/delete/${this.email.id.toString()}`;
      this.httpClient.delete(requestUrl).subscribe(
        (data: any) => {
          this.dialog.close(true); // true означает, что были изменения
        },
        (error) => this.reportServerError(error)
      );
    });
  }

  justCloseDialog() {
    this.dialog.close(false); // false означает, что изменений не было (письма не удаляли)
  }
}
