/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { AbstractMultiLineDataImporter } from 'src/app/utils/AbstractMultilineDataImporter';
import { TeamsListParserParameters } from './TeamsListParserParameters';
import { TeamDataModel } from 'src/app/data-model/TeamDataModel';
import { HttpHeaders } from '@angular/common/http';
import { TeamsListImporterComponent } from '../teams-list-importer.component';

export class TeamsListParser extends AbstractMultiLineDataImporter {
  private parameters: TeamsListParserParameters;
  private teams: TeamDataModel[];

  constructor(
    parameters: TeamsListParserParameters,
    onSuccess: (importerComponentReference: TeamsListImporterComponent, teams2Import: TeamDataModel[]) => void,
    onFailure: (importerComponentReference: TeamsListImporterComponent, errorMessage: string) => void
  ) {
    super(parameters.textWithTeamsList, onSuccess, onFailure);
    this.parameters = parameters;
  }

  processText() {
    const processedTeamNumbers: Set<number> = new Set();
    const processedTeamTitles: Set<string> = new Set();

    this.teams = [];
    while (this.sourceTextLinesIterator.hasNextLine()) {
      const lineWithTeamNumberAndTitle: string = this.sourceTextLinesIterator.nextLine();
      const teamNumberAndTitleArray: string[] = lineWithTeamNumberAndTitle.split(
        ','
      );

      const correctNumberOfElements = 2;
      if (teamNumberAndTitleArray.length !== correctNumberOfElements) {
        this.onFailure(
          this.parameters.parentComponentObject,
          `Ошибка в формате строки: '${lineWithTeamNumberAndTitle}'. Элемент списка должен содержать номер команды и её название, разделённые запятой. `
        );
        return;
      }

      const teamNumberString: string = teamNumberAndTitleArray[0];
      const teamTitle: string = teamNumberAndTitleArray[1];

      const teamNumberValidationMessage: string = this.parameters.teamValidationService.
        checkTeamNumberAndGetValidationMessage(teamNumberString);

      if (teamNumberValidationMessage && teamNumberValidationMessage.length > 0) {
        this.onFailure(this.parameters.parentComponentObject, `Ошибка в формате строки: '${lineWithTeamNumberAndTitle}'. ${teamNumberValidationMessage}`);
        return;
      }

      const teamNumber: number = TeamsListParser.parseInt(teamNumberString);

      const teamTitleValidationMessage: string = this.parameters.teamValidationService.checkTeamTitleAndGetValidationMessage(
        teamTitle
      );

      if (teamTitleValidationMessage && teamTitleValidationMessage.length > 0) {
        this.onFailure(this.parameters.parentComponentObject, `Ошибка в формате строки: '${lineWithTeamNumberAndTitle}'. ${teamTitleValidationMessage}`);
        return;
      }

      if (processedTeamNumbers.has(teamNumber)) {
        this.onFailure(this.parameters.parentComponentObject, `В строке: '${lineWithTeamNumberAndTitle}' указан повторяющийся номер команды. Он уже есть у другой команды выше в списке.`);
        return;
      }

      processedTeamNumbers.add(teamNumber);

      const teamTitleInLowerCase: string = teamTitle.toLowerCase();
      if (processedTeamTitles.has(teamTitleInLowerCase)) {
        this.onFailure(this.parameters.parentComponentObject, `В строке: '${lineWithTeamNumberAndTitle}' указано повторяющееся название команды. Это название уже есть у другой команды выше в списке.`);
        return;
      }

      processedTeamTitles.add(teamTitleInLowerCase);

      this.teams.push(
        TeamDataModel.createTeamByNumberAndTitle(teamNumber, teamTitle)
      );
    }

    if (this.teams.length === 0) {
      this.onFailure(this.parameters.parentComponentObject, 'Забыли задать текст со списком команд.');
      return;
    }

    // и в финале всего запускаем проверку корректности данных на основе ответа сервера
    this.doValidationWithServerData(this, this.teams);
  }

  private doValidationWithServerData(parserObjectReference: TeamsListParser, loadedTeams: TeamDataModel[]) {
    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/json; charset=utf-8'
    );

    const validationUrl = '/teams/validate';
    parserObjectReference.parameters.httpClient
      .post(validationUrl, loadedTeams, { headers })
      .subscribe(
        (validationErrors: string[]) => {
          if (validationErrors && validationErrors.length > 0) {
            // что-то с валидацией не то
            parserObjectReference.onFailure(parserObjectReference.parameters.parentComponentObject, validationErrors.join('\n')
            );
            return;
          } else {
            // валидация прошла успешно
            parserObjectReference.onSuccess(parserObjectReference.parameters.parentComponentObject, loadedTeams);
            return;
          }
        },
        (error) => {
          parserObjectReference.onFailure(
            parserObjectReference.parentComponentObject,
            `Не удалось получить информацию из базы данных о приемлемости номера и названия для команды.
            Дополнительная информация от сервера: Сообщение: ${error.message}. Код ошибки: ${error.status}`
          );
          return;
        }
      );
  }
}
