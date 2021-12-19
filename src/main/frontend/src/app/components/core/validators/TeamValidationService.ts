/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { AbstractModelValidationService } from '../base/AbstractModelValidationService';
import { HttpClient } from '@angular/common/http';

export class TeamValidationService extends AbstractModelValidationService {
  public maxTeamTitleLength: number;

  public maxTeamNumberValue: number;

  constructor(httpClient: HttpClient) {
    super();

    const url = '/teams/model-constraints';
    httpClient.get(url).subscribe(
      (data: Map<string, string>) => {
        this.maxTeamTitleLength = parseInt(data['MAX_TITLE_LENGTH'], 10);
        this.maxTeamNumberValue = parseInt(data['MAX_NUMBER_VALUE'], 10);
      },
      (error) => {
        const errorMessage = `$Ошибка при получении model-constraints для Team. ${error.error}. Код статуса: ${error.status}. Сообщение сервера: '${error.message}'`;
        this.setBrokenInternalState(errorMessage);
      }
    );
  }

  public isTeamNumberCorrect(teamNumber: string): boolean {
    const stringNumberRepresentation = teamNumber;
    const dotOrCommaIsPresent = stringNumberRepresentation.indexOf('.') !== -1 || stringNumberRepresentation.indexOf(',') !== -1;

    return (
      TeamValidationService.isNumber(teamNumber) && Number(teamNumber) >= 0 &&
      Number(teamNumber) <= this.maxTeamNumberValue && !dotOrCommaIsPresent
    );
  }

  public isTeamTitleCorrect(teamTitle: string): boolean {
    return (teamTitle && teamTitle.length > 0 && teamTitle.length <= this.maxTeamTitleLength);
  }

  /**
   * Проверяет корректность номера команды.
   * @param teamNumber строка с номером команды.
   * @return пустая строка, если всё в порядке, либо сообщение об ошибке, если номер команды неправильный.
   */
  public checkTeamNumberAndGetValidationMessage(teamNumberString: string): string {
    if (!this.isTeamNumberCorrect(teamNumberString)) {
      return `Номер команды может быть нулём или положительным целым числом не более ${this.maxTeamNumberValue}. А вы указали: ${teamNumberString}`;
    } else {
      return '';
    }
  }

  public checkTeamTitleAndGetValidationMessage(teamTitle: string): string {
    if (!this.isTeamTitleCorrect(teamTitle)) {
      return `Длина строки с названием команды не должна превышать ${this.maxTeamTitleLength} символов, а она составляет: ${teamTitle.length} символов`;
    } else {
      return '';
    }
  }
}
