import { TeamDataModel } from "src/app/model/TeamDataModel";
import { AbstractSingleLineDataImporter } from "src/app/utils/AbstractSinglelineDataImporter";
import { TeamValidationService } from "src/app/components/core/validators/TeamValidationService";
import { EmailValidationService } from "src/app/components/core/validators/EmailValidationService";
import { debugString } from "src/app/utils/Config";
import { EmailSubjectParserParameters } from "./EmailSubjectParserParameters";

export class EmailSubjectParser extends AbstractSingleLineDataImporter {
  private _emailValidationService: EmailValidationService;
  private _teamValidationService: TeamValidationService;

  private _team: TeamDataModel;
  private _roundNumber: string;

  private _onSuccess: Function;
  private _onFailure: Function;

  constructor(
    parameters: EmailSubjectParserParameters,
    onSuccess: Function,
    onFailure: Function
  ) {
    super(parameters.emailSubject);
    this._emailValidationService = parameters.emailValidationService;
    this._teamValidationService = parameters.teamValidationService;

    this._onSuccess = onSuccess;
    this._onFailure = onFailure;
  }

  public parse() {
    // если тема письма не задана, просто выходим,
    // не генерируя ошибки. Нужная информация может быть в теле письма.
    if (this.normalizedSourceString.length == 0) {
      this._onSuccess();
      return;
    }

    var subjectValidationMessage = this._emailValidationService.validateEmailSubject(
      this.normalizedSourceString
    );
    if (subjectValidationMessage.length > 0) {
      this._onFailure(subjectValidationMessage);
      return;
    }

    // вырезаем из темы письма префикс "Ответы команды " (на русском или на транслите)
    var processedSubject: string = EmailSubjectParser.extractSignificantPartFromTheEmailSubject(
      this.normalizedSourceString
    );

    var commaPosition = processedSubject.indexOf(",");
    if (commaPosition == -1) {
      this._onFailure("Некорректный формат темы письма. Нет запятой.");
      return;
    }

    var teamTitle = EmailSubjectParser.removeDoubleQuotations(
      processedSubject.substring(0, commaPosition)
    );

    var afterCommaSubjectPart = processedSubject.substring(commaPosition + 1);

    let {
      foundTeamNumber,
      foundRoundNumber,
    } = EmailSubjectParser.extractTeamAndRoundNumbers(afterCommaSubjectPart);

    // фиксируем номер раунда
    this._roundNumber = foundRoundNumber;

    // проверяем корректность номера команды и получаем сообщение, если номер некорректный
    var teamNumberValidationMessage = this._teamValidationService.checkTeamNumberAndGetValidationMessage(
      foundTeamNumber
    );

    if (teamNumberValidationMessage.length > 0) {
      this._onFailure(
        `Неверный номер команды в теме письма. ${teamNumberValidationMessage}`
      );
      return;
    }

    this._team = TeamDataModel.createTeamByNumberAndTitle(
      foundTeamNumber,
      teamTitle
    );

    this._onSuccess(this._team, this._roundNumber);
  }

  /**
   * Извлекает значимую часть темы письма, всё кроме префиксе "Ответы команды " или "Otvety komandy ".
   * @param sourceEmailSubject тема письма для обработки.
   * @returns значимая часть темы письма.
   */
  private static extractSignificantPartFromTheEmailSubject(
    sourceEmailSubject: string
  ): string {
    const subjectPrefixTransliterated: string = "otvety komandy ";
    const subjectPrefixRussian: string = "ответы команды ";

    // проверяем наличие префикса с lower-case строкой
    // а вырезаем уже из нормальной строки (sourceEmailSubject)
    var subjectInLowerCase: string = sourceEmailSubject.toLowerCase();

    var processedSubject: string;
    var prefixLocation = subjectInLowerCase.indexOf(
      subjectPrefixTransliterated
    );
    if (prefixLocation == -1) {
      prefixLocation = subjectInLowerCase.indexOf(subjectPrefixRussian);
      if (prefixLocation == -1) {
        processedSubject = sourceEmailSubject;
      } else {
        processedSubject = sourceEmailSubject.substring(
          prefixLocation + subjectPrefixRussian.length
        );
      }
    } else {
      processedSubject = sourceEmailSubject.substring(
        prefixLocation + subjectPrefixTransliterated.length
      );
    }

    return processedSubject;
  }

  /**
   * Извлекает номер команды и номер тура из темы письма.
   * @param afterCommaPartOfTheEmailSubject часть темы письма, после запятой.
   * @return возвращает два значения, первое - номер команды в виде строки, второе - номер тура в виде строки.
   */
  private static extractTeamAndRoundNumbers(
    afterCommaPartOfTheEmailSubject: string
  ): any {
    var foundTeamNumber: string = "";
    var foundRoundNumber: string = "";

    const openingParenthesisPrefix: string = "(";
    var openingParenthesisPrefixPosition = afterCommaPartOfTheEmailSubject.indexOf(
      openingParenthesisPrefix
    );

    if (openingParenthesisPrefixPosition !== -1) {
      // открывающая скобка представлена в теме письма

      var substringWithTeamNumber: string = afterCommaPartOfTheEmailSubject
        .substring(0, openingParenthesisPrefixPosition)
        .trim();

      foundTeamNumber = substringWithTeamNumber;

      foundRoundNumber = EmailSubjectParser.extractRoundNumberFromSubstring(
        afterCommaPartOfTheEmailSubject.substring(
          openingParenthesisPrefixPosition + 1
        )
      );
    } else {
      // если открывающей скобки нет в теме письма,
      // то вся правая часть темы письма после запятой - это номер команды.
      foundTeamNumber = afterCommaPartOfTheEmailSubject;
    }

    return { foundTeamNumber, foundRoundNumber };
  }

  private static extractRoundNumberFromSubstring(
    subjectSubstring: string
  ): string {
    var string2Check = subjectSubstring.toLowerCase();
    const preliminaryRoundPrefixRussian: string = "пред";
    const finalRoundPrefixRussian: string = "осн";
    const preliminaryRoundPrefixREnglish: string = "pred";
    const finalRoundPrefixEnglish: string = "osn";

    const preliminaryRoundNumberAlias: string = "1";
    const finalRoundNumberAlias: string = "2";

    if (
      string2Check.startsWith(preliminaryRoundPrefixRussian) ||
      string2Check.startsWith(preliminaryRoundPrefixREnglish)
    ) {
      // предварительный тур
      return preliminaryRoundNumberAlias;
    } else if (
      string2Check.startsWith(finalRoundPrefixRussian) ||
      string2Check.startsWith(finalRoundPrefixEnglish)
    ) {
      // окончательный тур
      return finalRoundNumberAlias;
    } else {
      // не распознали
      return "";
    }
  }
}
