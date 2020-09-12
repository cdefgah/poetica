/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { Component, OnInit } from '@angular/core';
import { AbstractInteractiveComponentModel } from '../core/base/AbstractInteractiveComponentModel';
import { MatDialog } from '@angular/material';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent extends AbstractInteractiveComponentModel implements OnInit {

  constructor(private httpClient: HttpClient, private dialog: MatDialog) {
    super();
  }

  public appVersion: string;

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
}
