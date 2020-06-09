import { Answer } from "src/app/model/Answer";
import { Team } from "src/app/model/Team";
import { AbstractDataImporter } from "src/app/utils/AbstractDataImporter";
import { AnswersImporterParameters } from "./AnswersImporterParameters";
import { StringBuilder } from "./StringBuilder";

export class AnswersImporter extends AbstractDataImporter {
  private emailModelConstraints: Map<string, number>;
  private answerModelConstraints: Map<string, number>;

  private roundNumber: string;

  private emailSubject: string;
  private emailBody: string;

  private teamInfoFromEmailSubject: Team;
  private teamInfoFromEmailBody: Team;

  private answers: Answer[] = [];

  constructor(parameters: AnswersImporterParameters) {
    super(parameters.emailBody);

    this.emailSubject = AnswersImporter.normalizeString(
      parameters.emailSubject
    );
    this.emailBody = AnswersImporter.normalizeString(parameters.emailBody);

    this.emailModelConstraints = parameters.emailModelConstraints;
    this.answerModelConstraints = parameters.answerModelConstraints;

    // проверяем корректность по размерам для письма
    this.validateEmailConstraints();
  }

  public parse(): void {
    this.parseEmailSubject(this.emailSubject);
    this.parseEmailBody();
  }

  public getRoundNumber(): string {
    return this.roundNumber;
  }

  public getTeamFromEmailSubject(): Team {
    return this.teamInfoFromEmailSubject;
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

    var teamTitle = AnswersImporter.removeDoubleQuotations(
      processedSubject.substring(0, commaPosition)
    );

    var afterCommaSubjectPart = processedSubject.substring(commaPosition + 1);

    let {
      foundTeamNumber,
      foundRoundNumber,
    } = AnswersImporter.extractTeamAndRoundNumbers(afterCommaSubjectPart);

    var teamNumber = foundTeamNumber;
    this.teamInfoFromEmailSubject = new Team(teamTitle, teamNumber);

    this.roundNumber = foundRoundNumber;

    console.log("=========== SUBJECT PARSING RESULT======================");
    console.log("teamTitle: " + this.teamInfoFromEmailSubject.title);
    console.log("teamNumber: " + this.teamInfoFromEmailSubject.number);
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

  /**
   * Проматывает указатель итератора на начало блока ответов
   * и возвращает её.
   * @returns первая строка блока ответов, из которой исключён префикс в три звёздочки.
   */
  private getTheFirstLineOfAnswersBlock(): string {
    const answersBlockPrefix: string = "***";
    while (this.sourceTextLinesIterator.hasNextLine()) {
      var oneLine = this.sourceTextLinesIterator.nextLine();
      if (oneLine.startsWith(answersBlockPrefix)) {
        return oneLine.substring(answersBlockPrefix.length + 1).trim();
      }
    }

    throw new Error("В теле письма не обнаружен признак начала блока ответов.");
  }

  private static processFirstLineOfTheAnswersBlock(firstLine: string): Team {
    var foundTeamTitle: string = "";
    var foundTeamNumber: string = "";

    if (firstLine.indexOf(",") !== -1) {
      var firstLineParts = firstLine.split(",");
      foundTeamTitle = firstLineParts[0].trim();
      foundTeamNumber = firstLineParts[1].trim();
    } else {
      foundTeamTitle = firstLine;
    }

    foundTeamTitle = AnswersImporter.removeDoubleQuotations(foundTeamTitle);

    return new Team(foundTeamNumber, foundTeamTitle);
  }

  private parseEmailBody(): void {
    if (this.answers.length > 0) {
      this.answers = [];
    }

    console.log("=== EMAIL BODY PARSING METHOD START ===");
    var firstLineFromAnswersBlock: string = this.getTheFirstLineOfAnswersBlock();

    console.log("--- firstLineFromAnswersBlock start --- ");
    console.log("|" + firstLineFromAnswersBlock + "|");
    console.log("--- firstLineFromAnswersBlock end --- ");

    this.teamInfoFromEmailBody = AnswersImporter.processFirstLineOfTheAnswersBlock(
      firstLineFromAnswersBlock
    );

    console.log("************ team info ******************");
    console.log("title: " + this.teamInfoFromEmailBody.title);
    console.log("number: " + this.teamInfoFromEmailBody.number);
    console.log("************ ********* ******************");

    var wholeAnswer: StringBuilder = new StringBuilder();
    var wholeComment: StringBuilder = new StringBuilder();

    const commentPrefix: string = "%";
    var questionNumber: string = "";
    var commentPrefixLocation: number;
    var processedQuestionNumbers = new Set();
    var previousQuestionNumber: number = -1;
    var continueProcessingLines: boolean = true;
    while (
      this.sourceTextLinesIterator.hasNextLine() &&
      continueProcessingLines
    ) {
      var currentLine = this.sourceTextLinesIterator.nextLine();

      if (currentLine.startsWith("#")) {
        // если строка начинается с символа, который знаменует начало ответа
        // сохраняем ранее сформированный ответ и комментарий к нему
        if (questionNumber.length > 0) {
          registerAnswer(this);
        }

        var dotLocation: number = currentLine.indexOf(".");
        if (dotLocation !== -1) {
          questionNumber = currentLine.substring(1, dotLocation).trim();
          if (!AnswersImporter.isPositiveInteger(questionNumber)) {
            throw new Error(
              "Ошибка в формате блока ответов. Возможно пропущена точка после номера бескрылки. Номер бескрылки должен быть положительным целым числом, а вместо это вот это: '" +
                questionNumber +
                "'"
            );
          }

          var firstLineOfTheAnswer: string = currentLine
            .substring(dotLocation + 1)
            .trim();

          var firstLineOfTheComment: string;
          commentPrefixLocation = firstLineOfTheAnswer.indexOf(commentPrefix);
          if (commentPrefixLocation !== -1) {
            // комментарий в первой строке представлен
            firstLineOfTheComment = firstLineOfTheAnswer
              .substring(commentPrefixLocation + 1)
              .trim();
            firstLineOfTheAnswer = firstLineOfTheAnswer
              .substring(0, commentPrefixLocation)
              .trim();

            wholeComment.addString(firstLineOfTheComment);
          }

          wholeAnswer.addString(firstLineOfTheAnswer);
        } else {
          throw new Error(
            "Неверный формат блока ответов. Нет ожидаемой точки при наличии символа # в строке: '" +
              currentLine +
              "'"
          );
        }
      } else {
        if (!currentLine.startsWith("***")) {
          // если строка НЕ начинается с символа, который знаменует начало ответа

          commentPrefixLocation = currentLine.indexOf(commentPrefix);

          if (commentPrefixLocation !== -1) {
            // в обрабатываемой строке есть комментарий
            var onlyAnswerPart: string = currentLine
              .substring(0, commentPrefixLocation)
              .trim();
            wholeAnswer.addString(onlyAnswerPart);

            var onlyCommentPart: string = currentLine
              .substring(commentPrefixLocation + 1)
              .trim();

            wholeComment.addString(onlyCommentPart);
          } else {
            // в обрабатываемой строке нет комментария
            wholeAnswer.addString(currentLine);
          }
        } else {
          // встретился знак конца блока ответов
          continueProcessingLines = false;
        }
      }
    }

    if (questionNumber.length > 0) {
      registerAnswer(this);
    }

    if (this.answers.length == 0) {
      throw new Error("В содержании письма не представлено ни одного ответа.");
    }
    // ================================================================================
    console.log(" ====== body parsing results start =====");

    this.answers.forEach((oneAnswer) => {
      console.log("-----------------------------------");
      console.log("Номер бескрылки: " + oneAnswer.questionNumber);
      console.log("Тело ответа: " + oneAnswer.body);
      console.log("Комментарий: " + oneAnswer.comment);
      console.log("-----------------------------------");
    });

    console.log(" ========== validating data ==========");
    this.validateTeamDataCorrectness();
    this.validateAnswerConstraints();
    console.log(" ====== body parsing results end =====");
    // ================================ Локальные функции ==============================
    function registerAnswer(currentObjectReference: AnswersImporter) {
      if (processedQuestionNumbers.has(questionNumber)) {
        throw new Error(
          "Повторяющийся номер бескрылки в блоке ответов: " + questionNumber
        );
      }

      if (previousQuestionNumber != -1) {
        if (Number(questionNumber) <= previousQuestionNumber) {
          throw new Error(
            "Номера бескрылок в блоке ответов должны идти в порядке возрастания. А у нас после номера: " +
              previousQuestionNumber +
              " идёт номер: " +
              questionNumber
          );
        }

        processedQuestionNumbers.add(questionNumber);
      }

      previousQuestionNumber = Number(questionNumber);

      // в ответе может быть просто номер с точкой
      // но не быть ответа (placeholder для читабельности),
      // в таком случае пустой ответ не регистрируем а пропускаем
      if (wholeAnswer.length() > 0) {
        currentObjectReference.answers.push(
          new Answer(
            questionNumber,
            wholeAnswer.toString(),
            wholeComment.toString()
          )
        );
      }

      questionNumber = "";
      wholeAnswer.reset();
      wholeComment.reset();
    }
    // =====================================================================================================
  }

  private validateTeamDataCorrectness(): void {}

  private validateAnswerConstraints(): void {
    const KEY_MAX_BODY_LENGTH: string = "MAX_BODY_LENGTH";
    const KEY_MAX_COMMENT_LENGTH: string = "MAX_COMMENT_LENGTH";

    const MAX_BODY_LENGTH: number = this.answerModelConstraints[
      KEY_MAX_BODY_LENGTH
    ];

    const MAX_COMMENT_LENGTH: number = this.answerModelConstraints[
      KEY_MAX_COMMENT_LENGTH
    ];

    this.answers.forEach((oneAnswer) => {
      if (oneAnswer.body && oneAnswer.body.length > MAX_BODY_LENGTH) {
        throw new Error(
          "Длина строки ответа на бескрылку с номером: " +
            oneAnswer.questionNumber +
            " (" +
            oneAnswer.body.length +
            ")превышает максимально разрешённый размер в " +
            MAX_BODY_LENGTH +
            " символов"
        );
      }

      if (oneAnswer.comment && oneAnswer.comment.length > MAX_COMMENT_LENGTH) {
        throw new Error(
          "Длина строки с комментарием к ответу на бескрылку с номером: " +
            oneAnswer.questionNumber +
            " ( " +
            oneAnswer.comment.length +
            ") превышает максимально разрешённый размер в " +
            MAX_COMMENT_LENGTH +
            " символов"
        );
      }
    });
  }

  private validateEmailConstraints(): void {
    const KEY_MAX_SUBJECT_LENGTH: string = "MAX_SUBJECT_LENGTH";
    const KEY_MAX_BODY_LENGTH: string = "MAX_BODY_LENGTH";

    const MAX_SUBJECT_LENGTH: number = this.emailModelConstraints[
      KEY_MAX_SUBJECT_LENGTH
    ];

    const MAX_BODY_LENGTH: number = this.emailModelConstraints[
      KEY_MAX_BODY_LENGTH
    ];

    if (this.emailSubject && this.emailSubject.length > MAX_SUBJECT_LENGTH) {
      throw new Error(
        "Длина строки с темой письма (" +
          this.emailSubject.length +
          ") превышает максимально разрешенный размер в " +
          MAX_SUBJECT_LENGTH +
          " символов"
      );
    }

    if (this.emailBody && this.emailBody.length > MAX_BODY_LENGTH) {
      throw new Error(
        "Длина содержимого письма (" +
          this.emailBody.length +
          ") превышает максимально разрешенный размер в " +
          MAX_BODY_LENGTH +
          " символов"
      );
    }
  }
}
