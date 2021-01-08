/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { TeamDetailsComponent } from '../team-details/team-details.component';
import { AbstractInteractiveComponentModel } from '../../core/base/AbstractInteractiveComponentModel';
import { TeamValidationService } from '../../core/validators/TeamValidationService';
import { TeamDataModel } from 'src/app/data-model/TeamDataModel';
import { TeamsListImporterComponent } from '../teams-list-importer/teams-list-importer.component';
import { MatTableDataSource, MatSort } from '@angular/material';

@Component({
  selector: 'app-teams-list',
  templateUrl: './teams-list.component.html',
  styleUrls: ['./teams-list.component.css'],
})
export class TeamsListComponent extends AbstractInteractiveComponentModel
  implements OnInit {
  constructor(private http: HttpClient, private dialog: MatDialog) {
    super();
    this.teamValidationService = new TeamValidationService(http);
    if (!this.teamValidationService.isInternalStateCorrect()) {
      this.displayMessage(this.teamValidationService.brokenStateDescription);
      return;
    }

    this.loadTeamsList();
  }

  private teamValidationService: TeamValidationService;

  @ViewChild(MatSort, { static: true }) teamsSortHandler: MatSort;

  displayedColumns: string[] = ['number', 'title'];

  teamsListDataSource: MatTableDataSource<TeamDataModel> = new MatTableDataSource([]);

  ngOnInit() { }

  protected getMessageDialogReference(): MatDialog {
    return this.dialog;
  }

  onRowClicked(row: any) {
    this.openDetailsDialog(row);
  }

  openDetailsDialog(selectedRow?: any) {
    const dialogConfig = TeamDetailsComponent.getDialogConfigWithData(
      this.teamValidationService,
      selectedRow
    );
    const dialogRef = this.dialog.open(TeamDetailsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result) => {
      if (result !== TeamDetailsComponent.DIALOG_RESULT_DECLINED) {
        // если диалог был принят (accepted), либо была удалена запись о команде
        // обновляем таблицу со списком команд
        this.loadTeamsList();
      }
    });
  }

  loadTeamsList() {
    const url = '/teams/all';
    this.http.get(url).subscribe(
      (teamsList: TeamDataModel[]) => {
        this.teamsListDataSource = new MatTableDataSource(teamsList);
        this.teamsListDataSource.sort = this.teamsSortHandler;
      },
      (error) => this.reportServerError(error)
    );
  }

  importTeams() {
    const importDialogConfig = TeamsListImporterComponent.getDialogConfigWithData(
      this.teamValidationService
    );
    const dialogRef = this.dialog.open(
      TeamsListImporterComponent,
      importDialogConfig
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // если диалог был принят (accepted)
        // обновляем страницу со списками
        this.loadTeamsList();
      }
    });
  }

  public ExportTeams() {
    const confirmationMessage = `Выгруженный список команд будет в формате требуемом механизмом импорта команд и в кодировке UTF-8 (Unicode).
     Выгруженный файл будет находиться в вашей папке загрузок (Downloads). Продолжать?`;

    const dialogAcceptedAction = () => {
      // если диалог был принят (accepted)
      // выгружаем команды
      const url = '/teams/export';
      window.location.href = url;
    };

    this.confirmationDialog(confirmationMessage, dialogAcceptedAction);
  }
}
