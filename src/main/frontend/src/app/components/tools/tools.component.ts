/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { Component, OnInit } from '@angular/core';
import { AbstractInteractiveComponentModel } from '../core/base/AbstractInteractiveComponentModel';
import { MatDialog } from '@angular/material';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css'],
})
export class ToolsComponent extends AbstractInteractiveComponentModel implements OnInit {

  constructor(private httpClient: HttpClient, private dialog: MatDialog) {
    super();
  }

  public appVersion: string;

  // наименование этого свойства может вводить в заблуждение
  // так как оно привязано к collapsed и при false
  // элемент будет именно collpased.
  // но это глюк в самом компоненте color-picker-а.
  public isColorPickerOpenedInitially = false;

  backgroundColorForRowWithGradedQuestion: string;
  backgroundColorForRowWithNotGradedQuestion: string;

  ngOnInit() {
    this.httpClient.get('reports/app-version', { responseType: 'text' }).subscribe(
      (versionInfoString: string) => {
        this.appVersion = versionInfoString;
      },
      (error) => this.reportServerError(error)
    );
  }

  protected getMessageDialogReference(): MatDialog {
    return this.dialog;
  }

  onColorSelected($colorSelectedEvent) {
    console.log('======== ON COLOR CHANGE ==== START');
    console.dir($colorSelectedEvent);
    console.log('======== ON COLOR CHANGE ==== END');
  }
}
