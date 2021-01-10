/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { AbstractInteractiveComponentModel } from '../../core/base/AbstractInteractiveComponentModel';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
  MatDialogConfig,
} from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfirmationDialogComponent } from '../../core/confirmation-dialog/confirmation-dialog.component';
import { TeamDataModel } from 'src/app/data-model/TeamDataModel';
import { TeamValidationService } from '../../core/validators/TeamValidationService';
import { TeamsListParserParameters } from './support/TeamsListParserParameters';
import { TeamsListParser } from './support/TeamsListParser';

@Component({
  selector: 'app-teams-list-importer',
  templateUrl: './teams-list-importer.component.html',
  styleUrls: ['./teams-list-importer.component.css'],
})
export class TeamsListImporterComponent
  extends AbstractInteractiveComponentModel
  implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private httpClient: HttpClient,
    public dialog: MatDialogRef<TeamsListImporterComponent>,
    public otherDialog: MatDialog
  ) {
    super();

    this._teamValidationService =
      dialogData[TeamsListImporterComponent.KEY_DIALOG_MODEL_VALIDATOR_SERVICE];
  }

  get IsFirstStepOk(): boolean {
    return this.firstStepErrorMessage.trim().length === 0;
  }

  get errorPresent(): boolean {
    return !this.IsFirstStepOk;
  }

  get errorsFound(): string {
    return this.firstStepErrorMessage.trim();
  }

  get allThingsAreOk(): boolean {
    return !this.errorPresent;
  }

  get lastStepTitle(): string {
    if (this.allThingsAreOk) {
      return 'Предварительный просмотр и импорт';
    } else {
      return 'Информация об ошибках';
    }
  }
  private static readonly KEY_DIALOG_MODEL_VALIDATOR_SERVICE =
    'modelValidatorService';

  private _teamValidationService: TeamValidationService;

  displayImportButton = false;

  displayedTeamColumns: string[] = ['number', 'title'];

  textWithTeamsList = '';

  teams: TeamDataModel[] = [];

  firstStepErrorMessage = '';

  static getDialogConfigWithData(
    teamValidationService: TeamValidationService
  ): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '62%';

    dialogConfig.data = new Map<string, any>();

    dialogConfig.data[
      TeamsListImporterComponent.KEY_DIALOG_MODEL_VALIDATOR_SERVICE
    ] = teamValidationService;

    return dialogConfig;
  }

  ngOnInit(): void { }

  protected getMessageDialogReference(): MatDialog {
    return this.otherDialog;
  }

  cancelDialog() {
    const confirmationDialogConfig: MatDialogConfig = ConfirmationDialogComponent.getDialogConfigWithData(
      'Прервать импорт команд?'
    );

    const dialogRef = this.otherDialog.open(
      ConfirmationDialogComponent,
      confirmationDialogConfig
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // если диалог был принят (accepted)
        this.dialog.close(false);
      }
    });
  }

  processTextWithTeamsList(onSuccess: (importerComponentReference: TeamsListImporterComponent, teams2Import: TeamDataModel[]) => void,
                           onFailure: (importerComponentReference: TeamsListImporterComponent, errorMessage: string) => void) {

    const teamsListParserParameters: TeamsListParserParameters = new TeamsListParserParameters();
    teamsListParserParameters.parentComponentObject = this;
    teamsListParserParameters.teamValidationService = this._teamValidationService;
    teamsListParserParameters.httpClient = this.httpClient;
    teamsListParserParameters.textWithTeamsList = this.textWithTeamsList;

    const parser: TeamsListParser = new TeamsListParser(
      teamsListParserParameters,
      onSuccess,
      onFailure
    );

    parser.processText();
  }

  textWithTeamsListProcessedOk(currentComponentReference: TeamsListImporterComponent, teams2Import: TeamDataModel[]) {
    currentComponentReference.firstStepErrorMessage = ''; // нет ошибок
    currentComponentReference.teams = teams2Import;

    // второй шаг имеет индекс == 1
    currentComponentReference.updateDisplayImportButton(1);
  }

  processingTextWithTeamsListFailed(currentComponentReference: TeamsListImporterComponent, errorMessage: string) {
    currentComponentReference.firstStepErrorMessage = errorMessage;

    // второй шаг имеет индекс == 1
    currentComponentReference.updateDisplayImportButton(1);
  }

  onStepChange(event: any) {
    // если перешли на нулевой шаг с любого
    if (event.selectedIndex === 0) {
      // сбрасываем состояние всех контролирующих переменных и выходим
      this.resetStepperVariables(event);
      return;
    }

    if (event.previouslySelectedIndex === 0) {
      // если ушли с первого шага (нулевой индекс), то обрабатываем список команд
      // обрабатываем список команд
      this.processTextWithTeamsList(this.textWithTeamsListProcessedOk, this.processingTextWithTeamsListFailed);
    }

    // пересчитываем признак, по которому мы определяем
    // показывать или нет кнопку импорта ответов
    this.updateDisplayImportButton(event.selectedIndex);
  }

  doImportTeams() {
    this.confirmationDialog('Импортировать команды?', () => {
      // если диалог был принят (accepted)

      const headers = new HttpHeaders().set(
        'Content-Type',
        'application/json; charset=utf-8'
      );

      // импортируем команды
      this.httpClient
        .post('/teams/import', this.teams, { headers })
        .subscribe(
          () => this.dialog.close(true),
          (error) => this.reportServerError(error, 'Сбой при импорте команд.')
        );
    });
  }

  private resetStepperVariables(stepChangeEvent: any): void {
    this.firstStepErrorMessage = '';
    this.updateDisplayImportButton(stepChangeEvent);
  }

  private updateDisplayImportButton(stepNumber: number) {
    // последний шаг в степпере имеет индекс 1 (0, 1)
    // кнопку показываем в том случае, если мы пришли на последний шаг
    // и у нас всё в порядке, то есть нет ошибок.
    this.displayImportButton = stepNumber === 1 && this.allThingsAreOk;
  }
}
