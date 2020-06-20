import { TeamDataModel } from "src/app/model/TeamDataModel";
import { AbstractSingleLineDataImporter } from "src/app/utils/AbstractSinglelineDataImporter";
import { TeamShallowValidationService } from "src/app/components/core/validators/TeamShallowValidationService";
import { EmailShallowValidationService } from "src/app/components/core/validators/EmailShallowValidationService";
import { debugString } from "src/app/utils/Config";

export class EmailSubjectParser extends AbstractSingleLineDataImporter {
  private _teamValidationService: TeamShallowValidationService;

  private _team: TeamDataModel;
  private _roundNumber: string;

  private _isEmpty: boolean = false;

  constructor(
    emailSubject: string,
    emailValidationService: EmailShallowValidationService,
    teamValidationService: TeamShallowValidationService
  ) {
    super(emailSubject);
    var normalizedEmailSubject: string = this._normalizedSourceString;
    debugString("normalizedEmailSubject: " + normalizedEmailSubject);

    if (
      normalizedEmailSubject.length > emailValidationService.maxSubjectLength
    ) {
      this.registerError(
        `Количество символов в теме письма (${normalizedEmailSubject.length}) больше, чем максимально разрешённое для обработки: ${emailValidationService.maxSubjectLength}`
      );
      return;
    }

    this._teamValidationService = teamValidationService;
  }

  get team(): TeamDataModel {
    return this._team;
  }

  get roundNumber(): string {
    return this._roundNumber;
  }

  get isEmpty(): boolean {
    return this._isEmpty;
  }

  public parseEmailSubject() {
    // если тема письма не задана, просто выходим,
    // не генерируя ошибки. Нужная информация может быть в теле письма.
    if (this._normalizedSourceString.length == 0) {
      this._isEmpty = true;
      return;
    }

    // вырезаем из темы письма префикс "Ответы команды " (на русском или на транслите)
    var processedSubject: string = EmailSubjectParser.extractSignificantPartFromTheEmailSubject(
      this._normalizedSourceString
    );

    debugString(`processedSubject: ${processedSubject}`);

    var commaPosition = processedSubject.indexOf(",");
    if (commaPosition == -1) {
      this.registerError("Некорректный формат темы письма. Нет запятой.");
      return;
    }

    var teamTitle = EmailSubjectParser.removeDoubleQuotations(
      processedSubject.substring(0, commaPosition)
    );

    debugString(`teamTitle: ${teamTitle}`);

    var afterCommaSubjectPart = processedSubject.substring(commaPosition + 1);

    debugString(`afterCommaSubjectPart: ${afterCommaSubjectPart}`);

    let {
      foundTeamNumber,
      foundRoundNumber,
    } = EmailSubjectParser.extractTeamAndRoundNumbers(afterCommaSubjectPart);

    // фиксируем номер раунда
    this._roundNumber = foundRoundNumber;

    debugString(`foundRoundNumber: ${foundRoundNumber}`);

    // проверяем корректность номера команды и получаем сообщение, если номер некорректный
    var teamNumberValidationMessage = this._teamValidationService.checkTeamNumberAndGetValidationMessage(
      foundTeamNumber
    );

    debugString(`teamNumberValidationMessage: ${teamNumberValidationMessage}`);

    if (teamNumberValidationMessage.length == 0) {
      // если нет ошибок валидации номера команды
      this._team = TeamDataModel.createTeamByNumberAndTitle(
        foundTeamNumber,
        teamTitle
      );

      debugString(`Team data from subject:${this._team.toString()}`);
    } else {
      // если ошибка была, фиксируем её
      debugString(
        `Team number from email subject validation failed. Error message: ${teamNumberValidationMessage}`
      );

      this.registerError(
        `Неверный номер команды в теме письма. ${teamNumberValidationMessage}`
      );
    }
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
