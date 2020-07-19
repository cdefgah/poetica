import { AbstractModelValidationService } from "../base/AbstractModelValidationService";
import { HttpClient } from "@angular/common/http";

export class TeamValidationService extends AbstractModelValidationService {
  private _maxTeamTitleLength: number;

  constructor(httpClient: HttpClient) {
    super();

    const url: string = "/teams/model-constraints";
    httpClient.get(url).subscribe(
      (data: Map<string, string>) => {
        this._maxTeamTitleLength = parseInt(data["MAX_TITLE_LENGTH"]);
      },
      (error) => {
        var errorMessage: string = `$Ошибка при получении model-constraints для Team. ${error.error}. Код статуса: ${error.status}. Сообщение сервера: '${error.message}'`;
        this.setBrokenInternalState(errorMessage);
      }
    );
  }

  get maxTeamTitleLength(): number {
    return this._maxTeamTitleLength;
  }

  public isTeamNumberCorrect(teamNumber: string): boolean {
    return (
      TeamValidationService.isNumber(teamNumber) && Number(teamNumber) >= 0
    );
  }

  /**
   * Проверяет корректность номера команды.
   * @param teamNumber строка с номером команды.
   * @return пустая строка, если всё в порядке, либо сообщение об ошибке, если номер команды неправильный.
   */
  public checkTeamNumberAndGetValidationMessage(
    teamNumberString: string
  ): string {
    if (!this.isTeamNumberCorrect(teamNumberString)) {
      return `Номер команды может быть нулём или положительным целым числом. А вы указали: ${teamNumberString}`;
    } else {
      return "";
    }
  }

  public checkTeamTitleAndGetValidationMessage(teamTitle: string): string {
    if (teamTitle && teamTitle.length > this._maxTeamTitleLength) {
      return `Длина строки с названием команды не должна превышать ${this._maxTeamTitleLength} символов, а она составляет: ${teamTitle.length} символов`;
    } else {
      return "";
    }
  }
}
