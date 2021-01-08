/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { Component, OnInit, Inject } from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
  MatDialogConfig,
} from '@angular/material';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AbstractInteractiveComponentModel } from '../../core/base/AbstractInteractiveComponentModel';
import { TeamValidationService } from '../../core/validators/TeamValidationService';
import { TeamDataModel } from '../../../data-model/TeamDataModel';
import { DialogResultFlags } from '../../../utils/DialogResultFlags';

@Component({
  selector: 'app-team-details',
  templateUrl: './team-details.component.html',
  styleUrls: ['./team-details.component.css'],
})
export class TeamDetailsComponent extends AbstractInteractiveComponentModel implements OnInit {

  private static readonly KEY_DIALOG_ID = 'id';
  private static readonly KEY_DIALOG_MODEL_VALIDATOR_SERVICE = 'modelValidatorService';

  public readonly modelValidatorService: TeamValidationService;

  dialogTitle: string;

  team: TeamDataModel;
  teamCopy: TeamDataModel;

  teamNumberIsIncorrect = false;
  teamTitleIsIncorrect = false;

  static getDialogConfigWithData(modelValidatorService: TeamValidationService, row?: any): MatDialogConfig {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '29%';

    dialogConfig.data = new Map<string, any>();

    dialogConfig.data[TeamDetailsComponent.KEY_DIALOG_MODEL_VALIDATOR_SERVICE] = modelValidatorService;

    if (row) {
      dialogConfig.data[TeamDetailsComponent.KEY_DIALOG_ID] = row[TeamDetailsComponent.KEY_DIALOG_ID];
    }

    return dialogConfig;
  }

  /**
   * Выполняет сброс флагов валидации,
   * чтобы не подсвечивались подписи для незаполненных полей.
   */
  private resetValidationFlags() {
    this.teamNumberIsIncorrect = false;
    this.teamTitleIsIncorrect = false;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private http: HttpClient,
    public dialog: MatDialogRef<TeamDetailsComponent>,
    public otherDialog: MatDialog
  ) {
    super();
    this.modelValidatorService = dialogData[TeamDetailsComponent.KEY_DIALOG_MODEL_VALIDATOR_SERVICE];

    // создаём объект, который затем, либо заполняем данными с сервера (редактирование существующей записи)
    // либо заполняем вручную, при создании новый команды, например.
    this.team = new TeamDataModel();
    this.team.id = dialogData[TeamDetailsComponent.KEY_DIALOG_ID];
  }

  ngOnInit(): void {
    if (this.team.id) {
      // редактируем существующее задание
      const url = `/teams/${this.team.id}`;
      this.http.get(url).subscribe(
        (data: Map<string, any>) => {
          this.team.setValuesFromMap(data);
          this.teamCopy = this.team.getObjectCopy();

          this.dialogTitle = this.getDialogTitle(this.team);
        },
        (error) => this.reportServerError(error)
      );
    } else {
      // объект новой команды уже создан, проставляем нужный флаг и формируем заголовок диалога для новой команды
      this.dialogTitle = this.getDialogTitle();
    }
   }

  protected getMessageDialogReference(): MatDialog {
    return this.otherDialog;
  }

  acceptDialog() {
    if (this.formValidationPassed()) {
      if (!this.team.id) {
        // добавляем новую запись
        const payload = new HttpParams()
          .set('teamNumber', String(this.team.number))
          .set('teamTitle', this.team.title.trim());

        this.http.post('/teams', payload).subscribe(
          () => this.dialog.close(DialogResultFlags.ChangesMade),
          (error) => this.reportServerError(error)
        );
      } else {
        // обновляем существующую запись
        const newTeamNumber: number =
          this.team.number !== this.teamCopy.number ? this.team.number : -1;

        const newTeamTitle: string =
          this.team.title !== this.teamCopy.title ? this.team.title : '';

        if (newTeamNumber >= 0 || newTeamTitle.length > 0) {
          // данные изменились, обновляем их на сервере
          const requestUrl = `/teams/${this.team.id}`;
          const payload = new HttpParams()
            .set('newTeamNumber', String(newTeamNumber))
            .set('newTeamTitle', newTeamTitle);

          this.http.put(requestUrl, payload).subscribe(
            () => this.dialog.close(DialogResultFlags.ChangesMade),
            (error) => this.reportServerError(error)
          );
        } else {
          // никаких изменений не было
          // закрываем и не делаем лишнего запроса для обновления данных с сервера
          this.dialog.close(DialogResultFlags.NoChangesMade);
        }
      }
    }
  }

  cancelDialog() {
    this.dialog.close(DialogResultFlags.NoChangesMade);
  }

  deleteRecord() {
    const confirmationMessage = `Удалить команду: '${this.team.title}' (номер: ${this.team.number}) ?`;

    this.confirmationDialog(confirmationMessage, () => {
      // если диалог был принят (accepted)
      const url = `/teams/${this.team.id}`;
      this.http.delete(url).subscribe(
        () => this.dialog.close(DialogResultFlags.ChangesMade),
        (error) => this.reportServerError(error)
      );
    });
  }

  get isExistingRecord(): boolean {
    return this.team.id ? true : false;
  }

  private getDialogTitle(teamObject?: TeamDataModel): string {
    if (!teamObject) {
      return 'Новая команда';
    } else {
      return `Команда №${teamObject.number}`;
    }
  }

  /**
   * Выполняет проверку корректности заполнения полей.
   * @returns true, если поля заполнены корректно, иначе false.
   */
  private formValidationPassed(): boolean {
    this.resetValidationFlags();

    this.teamNumberIsIncorrect = !this.modelValidatorService.isTeamNumberCorrect(String(this.team.number));
    this.teamTitleIsIncorrect = !this.modelValidatorService.isTeamTitleCorrect(this.team.title);

    return !(this.teamNumberIsIncorrect || this.teamTitleIsIncorrect);
  }
}
