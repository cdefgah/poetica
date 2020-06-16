import { AbstractModelValidationService } from "../base/AbstractModelValidationService";
import { HttpClient } from "@angular/common/http";

export class TeamShallowValidationService extends AbstractModelValidationService {
  private _modelConstraints: Map<string, string>;
  private _numberRegExValidator: RegExp;

  private _maxTeamTitleLength: number;
  private _requiredTeamNumberLength: number;

  constructor(httpClient: HttpClient) {
    super();

    const url: string = "/teams/model-constraints";
    httpClient.get(url).subscribe(
      (data: Map<string, string>) => {
        this._modelConstraints = data;

        this._numberRegExValidator = new RegExp(
          this._modelConstraints["NUMBER_VALIDATION_REGEXP"]
        );
        this._requiredTeamNumberLength = parseInt(
          this._modelConstraints["REQUIRED_NUMBER_LENGTH"]
        );
        this._maxTeamTitleLength = parseInt(
          this._modelConstraints["MAX_TITLE_LENGTH"]
        );
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

  get requiredTeamNumberLength(): number {
    return this._requiredTeamNumberLength;
  }

  public isTeamNumberCorrect(teamNumber: string): boolean {
    return this._numberRegExValidator.test(teamNumber);
  }

  /**
   * Проверяет корректность номера команды.
   * @param teamNumber строка с номером команды.
   * @return пустая строка, если всё в порядке, либо сообщение об ошибке, если номер команды неправильный.
   */
  public checkTeamNumberAndGetValidationMessage(teamNumber: string): string {
    if (!this.isTeamNumberCorrect(teamNumber)) {
      return `Номер команды должен быть ${this._requiredTeamNumberLength}-значным положительным целым числом. А вы указали: ${teamNumber}`;
    } else {
      return "";
    }
  }
}
