import { TeamDataModel } from 'src/app/data-model/TeamDataModel';
import { AbstractSingleLineDataImporter } from 'src/app/utils/AbstractSinglelineDataImporter';
import { TeamValidationService } from 'src/app/components/core/validators/TeamValidationService';
import { EmailValidationService } from 'src/app/components/core/validators/EmailValidationService';
import { EmailSubjectParserParameters } from './EmailSubjectParserParameters';
import { debugString, debugObject } from 'src/app/utils/Config';

export class EmailSubjectParser extends AbstractSingleLineDataImporter {
  private emailValidationService: EmailValidationService;
  private teamValidationService: TeamValidationService;

  private team: TeamDataModel;
  private roundNumber: string;

  /**
   * Извлекает значимую часть темы письма, всё кроме префиксе "Ответы команды " или "Otvety komandy ".
   * @param sourceEmailSubject тема письма для обработки.
   * @returns значимая часть темы письма.
   */
  private static extractSignificantPartFromTheEmailSubject(sourceEmailSubject: string): string {
    const subjectPrefixTransliterated = 'otvety komandy ';
    const subjectPrefixRussian = 'ответы команды ';

    // проверяем наличие префикса с lower-case строкой
    // а вырезаем уже из нормальной строки (sourceEmailSubject)
    const subjectInLowerCase: string = sourceEmailSubject.toLowerCase();

    let processedSubject: string;
    let prefixLocation = subjectInLowerCase.indexOf(subjectPrefixTransliterated);
    if (prefixLocation === -1) {
      prefixLocation = subjectInLowerCase.indexOf(subjectPrefixRussian);
      if (prefixLocation === -1) {
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
  private static extractTeamAndRoundNumbers(afterCommaPartOfTheEmailSubject: string): any {
    let foundTeamNumberString = '';
    let foundRoundNumber = '';

    const openingParenthesisPrefix = '(';
    const openingParenthesisPrefixPosition = afterCommaPartOfTheEmailSubject.indexOf(openingParenthesisPrefix);

    if (openingParenthesisPrefixPosition !== -1) {
      // открывающая скобка представлена в теме письма

      const substringWithTeamNumber: string = afterCommaPartOfTheEmailSubject.substring(0, openingParenthesisPrefixPosition).trim();

      foundTeamNumberString = substringWithTeamNumber;

      foundRoundNumber = EmailSubjectParser.extractRoundNumberFromSubstring(
        afterCommaPartOfTheEmailSubject.substring(openingParenthesisPrefixPosition + 1));
    } else {
      // если открывающей скобки нет в теме письма,
      // то вся правая часть темы письма после запятой - это номер команды.
      foundTeamNumberString = afterCommaPartOfTheEmailSubject;
    }

    return { foundTeamNumberString, foundRoundNumber };
  }

  private static extractRoundNumberFromSubstring(subjectSubstring: string): string {
    const string2Check = subjectSubstring.toLowerCase();
    const preliminaryRoundPrefixRussian = 'пред';
    const finalRoundPrefixRussian = 'осн';
    const preliminaryRoundPrefixREnglish = 'pred';
    const finalRoundPrefixEnglish = 'osn';

    const preliminaryRoundNumberAlias = '1';
    const finalRoundNumberAlias = '2';

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
      return '';
    }
  }

  constructor(
    parameters: EmailSubjectParserParameters,
    onSuccess: Function,
    onFailure: Function
  ) {
    super(parameters.emailSubject, onSuccess, onFailure);
    this.parentComponentObject = parameters.parentComponentObject;
    this.emailValidationService = parameters.emailValidationService;
    this.teamValidationService = parameters.teamValidationService;
  }

  public parse() {
    // если тема письма не задана, просто выходим,
    // не генерируя ошибки. Нужная информация может быть в теле письма.
    if (this.normalizedSourceString.length === 0) {
      this.onSuccess(this.parentComponentObject, null, null);
      return;
    }

    const subjectValidationMessage = this.emailValidationService.validateEmailSubject(
      this.normalizedSourceString
    );
    if (subjectValidationMessage.length > 0) {
      this.onFailure(this.parentComponentObject, subjectValidationMessage);
      return;
    }

    // вырезаем из темы письма префикс "Ответы команды " (на русском или на транслите)
    const processedSubject: string = EmailSubjectParser.extractSignificantPartFromTheEmailSubject(
      this.normalizedSourceString
    );

    const commaPosition = processedSubject.indexOf(',');
    if (commaPosition === -1) {
      this.onFailure(this.parentComponentObject, 'Некорректный формат темы письма. Нет запятой.');
      return;
    }

    const teamTitle = EmailSubjectParser.removeDoubleQuotations(
      processedSubject.substring(0, commaPosition)
    );

    const afterCommaSubjectPart = processedSubject.substring(commaPosition + 1);

    const {
      foundTeamNumberString,
      foundRoundNumber,
    } = EmailSubjectParser.extractTeamAndRoundNumbers(afterCommaSubjectPart);

    debugString(`foundTeamNumberString: ${foundTeamNumberString}`);
    debugString(`foundRoundNumber: ${foundRoundNumber}`);

    // фиксируем номер раунда
    this.roundNumber = foundRoundNumber;

    // проверяем корректность номера команды и получаем сообщение, если номер некорректный
    const teamNumberValidationMessage = this.teamValidationService.checkTeamNumberAndGetValidationMessage(
      foundTeamNumberString
    );

    if (teamNumberValidationMessage.length > 0) {
      this.onFailure(this.parentComponentObject, `Неверный номер команды в теме письма. ${teamNumberValidationMessage}`);
      return;
    }

    const foundTeamNumber = EmailSubjectParser.parseInt(foundTeamNumberString);
    debugString('foundTeamNumber: ' + foundTeamNumber);

    this.team = TeamDataModel.createTeamByNumberAndTitle(foundTeamNumber, teamTitle);

    debugString('this.team is below...');
    debugObject(this.team);

    this.onSuccess(this.parentComponentObject, this.team, this.roundNumber);
  }
}
