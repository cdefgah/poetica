import { AbstractDataImporter } from "src/app/utils/AbstractDataImporter";

export class AnswersImporter extends AbstractDataImporter {
  private teamModelConstraints: Map<string, number>;
  private emailModelConstraints: Map<string, number>;
  private answerModelConstraints: Map<string, number>;

  private roundNumber: string;
  private teamTitle: string;
  private teamNumber: string;

  private emailSubject: string;

  constructor(
    emailSubject: string,
    emailBody: string,
    teamModelConstraints: Map<string, number>,
    emailModelConstraints: Map<string, number>,
    answerModelConstraints: Map<string, number>
  ) {
    super(emailBody);
    this.emailSubject = AnswersImporter.normalizeString(emailSubject);

    this.teamModelConstraints = teamModelConstraints;
    this.emailModelConstraints = emailModelConstraints;
    this.answerModelConstraints = answerModelConstraints;
  }

  public parse(): void {
    this.parseEmailSubject(this.emailSubject);
    this.parseEmailBody();
  }

  public getRoundNumber(): string {
    return this.roundNumber;
  }

  public getTeamTitle(): string {
    return this.teamTitle;
  }

  public getTeamNumber(): string {
    return this.teamNumber;
  }

  private parseEmailSubject(sourceEmailSubject: string): void {
    // вырезаем из темы письма префикс "Ответы команды " (на русском или на транслите)
    var processedSubject: string = AnswersImporter.extractSignificantPartFromTheEmailSubject(
      sourceEmailSubject
    );

    var commaPosition = processedSubject.indexOf(",");
    if (commaPosition == -1) {
      throw new Error("Некорректный формат темы письма. Нет запятой.");
    }

    this.teamTitle = AnswersImporter.removeDoubleQuotations(
      processedSubject.substring(0, commaPosition)
    );

    var afterCommaSubjectPart = processedSubject.substring(commaPosition + 1);

    let {
      foundTeamNumber,
      foundRoundNumber,
    } = AnswersImporter.extractTeamAndRoundNumbers(afterCommaSubjectPart);

    this.teamNumber = foundTeamNumber;
    this.roundNumber = foundRoundNumber;

    console.log("=========== SUBJECT PARSING RESULT======================");
    console.log("teamTitle: " + this.teamTitle);
    console.log("teamNumber: " + this.teamNumber);
    console.log("roundNumber: " + this.roundNumber);
    console.log("========================================================");
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

      if (AnswersImporter.checkTeamNumberFormat(substringWithTeamNumber)) {
        foundTeamNumber = substringWithTeamNumber;
      }

      foundRoundNumber = AnswersImporter.extractRoundNumberFromSubstring(
        afterCommaPartOfTheEmailSubject.substring(
          openingParenthesisPrefixPosition + 1
        )
      );
    } else {
      // если открывающей скобки нет в теме письма,
      // то вся правая часть темы письма после запятой - это номер команды.

      // по этому номеру будем делать запрос
      // и получать информацию о команде. И сверять название команды в базе
      // с названием команды по номеру.
      if (
        AnswersImporter.checkTeamNumberFormat(afterCommaPartOfTheEmailSubject)
      ) {
        foundTeamNumber = afterCommaPartOfTheEmailSubject;
      }
    }

    return { foundTeamNumber, foundRoundNumber };
  }

  private static checkTeamNumberFormat(stringWithTeamNumber: string) {
    if (!AnswersImporter.isPositiveInteger(stringWithTeamNumber)) {
      throw new Error(
        "Номер команды в теме письма должен быть целым положительным числом, а вы передали: " +
          stringWithTeamNumber
      );
    }
    return true;
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

  private parseEmailBody(): void {}
}
