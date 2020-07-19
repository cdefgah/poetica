import { AbstractMultiLineDataImporter } from "src/app/utils/AbstractMultilineDataImporter";
import { TeamsListParserParameters } from "./TeamsListParserParameters";
import { TeamDataModel } from "src/app/data-model/TeamDataModel";
import { HttpHeaders } from "@angular/common/http";
import { debugString, debugObject } from "src/app/utils/Config";

export class TeamsListParser extends AbstractMultiLineDataImporter {
  private _parameters: TeamsListParserParameters;
  private _teams: TeamDataModel[];

  constructor(
    parameters: TeamsListParserParameters,
    onSuccess: Function,
    onFailure: Function
  ) {
    super(parameters.textWithTeamsList, onSuccess, onFailure);
    this._parameters = parameters;
  }

  processText() {
    var processedTeamNumbers: Set<number> = new Set();
    var processedTeamTitles: Set<string> = new Set();

    this._teams = [];
    while (this._sourceTextLinesIterator.hasNextLine()) {
      var lineWithTeamNumberAndTitle: string = this._sourceTextLinesIterator.nextLine();
      var teamNumberAndTitleArray: string[] = lineWithTeamNumberAndTitle.split(
        ","
      );

      const correctNumberOfElements = 2;
      if (teamNumberAndTitleArray.length !== correctNumberOfElements) {
        this._onFailure(
          this._parameters.parentComponentObject,
          `Ошибка в формате строки: '${lineWithTeamNumberAndTitle}'. Элемент списка должен содержать номер команды и её название, разделённые запятой. `
        );
        return;
      }

      var teamNumberString: string = teamNumberAndTitleArray[0];
      var teamTitle: string = teamNumberAndTitleArray[1];

      var teamNumberValidationMessage: string = this._parameters.teamValidationService.checkTeamNumberAndGetValidationMessage(
        teamNumberString
      );

      if (
        teamNumberValidationMessage &&
        teamNumberValidationMessage.length > 0
      ) {
        this._onFailure(
          this._parameters.parentComponentObject,
          `Ошибка в формате строки: '${lineWithTeamNumberAndTitle}'. ${teamNumberValidationMessage}`
        );
        return;
      }

      var teamNumber: number = parseInt(teamNumberString);

      var teamTitleValidationMessage: string = this._parameters.teamValidationService.checkTeamTitleAndGetValidationMessage(
        teamTitle
      );
      if (teamTitleValidationMessage && teamTitleValidationMessage.length > 0) {
        this._onFailure(
          this._parameters.parentComponentObject,
          `Ошибка в формате строки: '${lineWithTeamNumberAndTitle}'. ${teamTitleValidationMessage}`
        );
        return;
      }

      if (processedTeamNumbers.has(teamNumber)) {
        this._onFailure(
          this._parameters.parentComponentObject,
          `В строке: '${lineWithTeamNumberAndTitle}' указан повторяющийся номер команды. Он уже есть у другой команды выше в списке.`
        );
        return;
      }

      processedTeamNumbers.add(teamNumber);

      var teamTitleInLowerCase: string = teamTitle.toLowerCase();
      if (processedTeamTitles.has(teamTitleInLowerCase)) {
        this._onFailure(
          this._parameters.parentComponentObject,
          `В строке: '${lineWithTeamNumberAndTitle}' указано повторяющееся название команды. Это название уже есть у другой команды выше в списке.`
        );
        return;
      }

      processedTeamTitles.add(teamTitleInLowerCase);

      this._teams.push(
        TeamDataModel.createTeamByNumberAndTitle(teamNumber, teamTitle)
      );
    }

    if (this._teams.length == 0) {
      this._onFailure(
        this._parameters.parentComponentObject,
        "Забыли задать текст со списком команд."
      );
      return;
    }

    // и в финале всего запускаем проверку корректности данных на основе ответа сервера
    this.doValidationWithServerData(this, this._teams);
  }

  private doValidationWithServerData(
    parserObjectReference: TeamsListParser,
    loadedTeams: TeamDataModel[]
  ) {
    debugString(
      "Validating teams using server-side data. Teams list is below:"
    );
    debugObject(loadedTeams);

    const headers = new HttpHeaders().set(
      "Content-Type",
      "application/json; charset=utf-8"
    );

    const validationUrl = "/teams/validate";
    parserObjectReference._parameters.httpClient
      .post(validationUrl, loadedTeams, { headers: headers })
      .subscribe(
        (validationErrors: string[]) => {
          debugString("Server reponse received.");

          if (validationErrors && validationErrors.length > 0) {
            // что-то с валидацией не то
            debugString("There are some validation issues listed below");
            debugObject(validationErrors);

            parserObjectReference._onFailure(
              parserObjectReference._parameters.parentComponentObject,
              validationErrors.join("\n")
            );
            return;
          } else {
            // валидация прошла успешно
            debugString("Server-side validation passed ok");
            parserObjectReference._onSuccess(
              parserObjectReference._parameters.parentComponentObject,
              loadedTeams
            );
            return;
          }
        },
        (error) => {
          debugString("Validation failed. Error object is below");
          debugObject(error);
          debugString("parserObjectReference object is below:");
          debugObject(parserObjectReference);
          debugString(
            "parserObjectReference._parentComponentObject object is below:"
          );
          debugObject(parserObjectReference._parentComponentObject);

          parserObjectReference._onFailure(
            parserObjectReference._parentComponentObject,
            `Не удалось получить информацию из базы данных о приемлемости номера и названия для команды. 
            Дополнительная информация от сервера: Сообщение: ${error.message}. Код ошибки: ${error.status}`
          );
          return;
        }
      );
  }
}
