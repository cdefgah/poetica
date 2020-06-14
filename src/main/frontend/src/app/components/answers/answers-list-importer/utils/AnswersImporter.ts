import { Answer } from "src/app/model/Answer";
import { Team } from "src/app/model/Team";
import { AbstractDataImporter } from "src/app/utils/AbstractDataImporter";
import { AnswersImporterParameters } from "./AnswersImporterParameters";
import { StringBuilder } from "./StringBuilder";
import { HttpClient } from "@angular/common/http";
import { debugString } from "src/app/utils/Config";

export class AnswersImporter extends AbstractDataImporter {
  private emailModelConstraints: Map<string, number>;
  private answerModelConstraints: Map<string, number>;

  private roundNumber: string;

  private emailSubject: string;
  private emailBody: string;

  private teamInfoFromEmailSubject: Team;
  private teamInfoFromEmailBody: Team;

  private answers: Answer[] = [];

  private http: HttpClient;

  // обёртка вокруг Promise, гарантирующая (на самом деле - нихуя не гарантирующая),
  // что Promise будет всегда будет в состоянии resolved().
  // даже при ошибке.
  private sureThing = (promise: Promise<any>) =>
    promise
      .then((data) => ({ ok: true, data }))
      .catch((error) => Promise.resolve({ ok: false, error }));

  constructor(parameters: AnswersImporterParameters) {
    super(parameters.emailBody);

    this.emailSubject = AnswersImporter.normalizeString(
      parameters.emailSubject
    );
    this.emailBody = AnswersImporter.normalizeString(parameters.emailBody);

    this.emailModelConstraints = parameters.emailModelConstraints;
    this.answerModelConstraints = parameters.answerModelConstraints;

    this.http = parameters.http;

    // проверяем корректность по размерам для письма
    this.validateEmailConstraints();
  }

  public async parse() {
    debugString("Parsing process started");

    const subjectParsingResult = await this.sureThing(this.parseEmailSubject());
    if (subjectParsingResult.ok) {
      debugString("Subject parsed ok. Parsing email body");
      // const emailParsingResult;
    } else {
      var errorMessage = subjectParsingResult["error"];
      debugString(`Subject parsed failed. Error message: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    // await this.parseEmailBodyAsync();
  }

  public getRoundNumber(): string {
    return this.roundNumber;
  }

  public getTeamFromEmailSubject(): Team {
    return this.teamInfoFromEmailSubject;
  }

  private parseEmailSubject(): Promise<void> {
    return new Promise((resolve, reject) => {
      debugString("Parsing email subject: start");

      // если тема письма не задана - выходим
      // исключение не бросаем. Ожидаем, что в теле письма есть информация нужная
      if (this.emailSubject.length == 0) {
        debugString("Email subject is empty. Exiting");
        resolve();
        return;
      }

      // вырезаем из темы письма префикс "Ответы команды " (на русском или на транслите)
      var processedSubject: string = AnswersImporter.extractSignificantPartFromTheEmailSubject(
        this.emailSubject
      );

      debugString(`processedSubject: ${processedSubject}`);

      var commaPosition = processedSubject.indexOf(",");
      if (commaPosition == -1) {
        reject("Некорректный формат темы письма. Нет запятой.");
        return;
      }

      var teamTitle = AnswersImporter.removeDoubleQuotations(
        processedSubject.substring(0, commaPosition)
      );

      debugString(`teamTitle: ${teamTitle}`);

      var afterCommaSubjectPart = processedSubject.substring(commaPosition + 1);

      debugString(`afterCommaSubjectPart: ${afterCommaSubjectPart}`);

      let {
        foundTeamNumber,
        foundRoundNumber,
      } = AnswersImporter.extractTeamAndRoundNumbers(afterCommaSubjectPart);

      debugString(`foundTeamNumber: ${foundTeamNumber}`);
      debugString(`foundRoundNumber: ${foundRoundNumber}`);

      var teamNumber = foundTeamNumber;
      this.teamInfoFromEmailSubject = new Team(teamNumber, teamTitle);

      this.roundNumber = foundRoundNumber;

      debugString("=========== SUBJECT PARSING RESULT======================");
      debugString("team: " + this.teamInfoFromEmailSubject.toString());
      debugString("roundNumber: " + this.roundNumber);
      debugString("========================================================");
    });
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
      if (AnswersImporter.isPositiveInteger(afterCommaPartOfTheEmailSubject)) {
        foundTeamNumber = afterCommaPartOfTheEmailSubject;
      } else {
        throw new Error(
          `Номер команды в теме письма должен быть целым положительным числом, а вы передали: ${afterCommaPartOfTheEmailSubject}`
        );
      }
    }

    return { foundTeamNumber, foundRoundNumber };
  }

  private static checkTeamNumberFormat(stringWithTeamNumber: string) {
    if (!AnswersImporter.isPositiveInteger(stringWithTeamNumber)) {
      throw new Error(
        `Номер команды в теме письма должен быть целым положительным числом, а вы передали: ${stringWithTeamNumber}`
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

  private async parseEmailBodyAsync() {
    if (this.answers.length > 0) {
      this.answers = [];
    }

    console.log("=== EMAIL BODY PARSING METHOD START ===");
    var firstLineFromAnswersBlock: string = this.getTheFirstLineOfAnswersBlock();
    var maxQuestionNumber: number = 1;

    this.teamInfoFromEmailBody = AnswersImporter.processFirstLineOfTheAnswersBlock(
      firstLineFromAnswersBlock
    );

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
              `Ошибка в формате блока ответов. Возможно пропущена точка после номера бескрылки. 
              Номер бескрылки должен быть положительным целым числом, а вместо это вот это: '${questionNumber}'`
            );
          } else {
            // номера заданий могут идти не порядку, так что заводим отдельную переменную
            // и фиксируем в ней максимальный номер задания (вопроса)
            // это нужно, чтобы потом проверить корректность загружаемых данных.
            maxQuestionNumber = Math.max(
              maxQuestionNumber,
              Number(questionNumber)
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
            `Неверный формат блока ответов. Нет ожидаемой точки при наличии символа # в строке: '${currentLine}'`
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
    console.log(" ====== body parsing results block start =====");

    this.answers.forEach((oneAnswer) => {
      console.log("-----------------------------------");
      console.log("Номер бескрылки: " + oneAnswer.questionNumber);
      console.log("Тело ответа: " + oneAnswer.body);
      console.log("Комментарий: " + oneAnswer.comment);
      console.log("-----------------------------------");
    });

    console.log(" ========== validating data ==========");
    this.validateTeamInfoCongruenceBetweenSubjectAndBody();
    this.validateAnswerConstraints();

    await this.validateMaxQuestionNumberAsync(maxQuestionNumber);
    await this.validateTeamDataCorrectnessAsync();

    console.log(" ====== body parsing results block end =====");

    // ================================ Локальные функции ==============================
    function registerAnswer(currentObjectReference: AnswersImporter) {
      if (processedQuestionNumbers.has(questionNumber)) {
        throw new Error(
          `Повторяющийся номер бескрылки в блоке ответов: ${questionNumber}`
        );
      }

      if (previousQuestionNumber != -1) {
        if (Number(questionNumber) <= previousQuestionNumber) {
          throw new Error(
            `Номера бескрылок в блоке ответов должны идти в порядке возрастания. 
            А у нас после номера: ${previousQuestionNumber} идёт номер: ${questionNumber}`
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

  private validateTeamInfoCongruenceBetweenSubjectAndBody() {
    if (
      this.teamInfoFromEmailSubject &&
      this.teamInfoFromEmailSubject.getNumber() !=
        this.teamInfoFromEmailBody.getNumber()
    ) {
      throw new Error(
        `Номер команды в теме письма: ${this.teamInfoFromEmailSubject.getNumber()} не совпадает с номером команды в содержании письма: 
        ${this.teamInfoFromEmailBody.getNumber()}`
      );
    }
  }

  private async validateMaxQuestionNumberAsync(
    maxQuestionNumberInAnswers: number
  ) {
    const url: string = "/questions/max-number";
    this.http.get(url).subscribe(
      (maxNumberOfRegisteredQuestion: number) => {
        if (maxNumberOfRegisteredQuestion < maxQuestionNumberInAnswers) {
          throw new Error(`Максимальный номер задания, зарегистрированного в базе данных равен: ${maxNumberOfRegisteredQuestion}. 
          Но среди импортируемых ответов представлен ответ на задание с номером: ${maxQuestionNumberInAnswers}`);
        }
      },
      (error) => {
        throw new Error(
          `Не удалось получить информацию из базы данных о максимальном номере загруженного задания. 
          Дополнительная информация от сервера: Сообщение: ${error.message}. Код ошибки: ${error.status}`
        );
      }
    );
  }

  private async validateTeamDataCorrectnessAsync() {
    const url: string = `/teams/numbers/${this.teamInfoFromEmailBody.getNumber()}`;
    var importingTeamTitle = this.teamInfoFromEmailBody.getTitle();
    this.http.get(url).subscribe(
      (data: Map<string, any>) => {
        var loadedTeamTitle: string = data["title"];
        if (
          loadedTeamTitle.toLowerCase() !== importingTeamTitle.toLowerCase()
        ) {
          throw new Error(
            `В базе данных команда с номером: ${this.teamInfoFromEmailBody.getNumber()} записана как '${loadedTeamTitle}'. 
            А в письме передано название команды: '${importingTeamTitle}'`
          );
        }
      },
      (error) => {
        const NOT_FOUND_STATUS: number = 404;
        var errorMessage: string;
        if (error.status == NOT_FOUND_STATUS) {
          errorMessage = `Не удалось найти в базе данных команду с номером: ${this.teamInfoFromEmailBody.getNumber()}`;
        } else {
          errorMessage = `Не удалось получить информацию из базы данных о команде с номером: ${this.teamInfoFromEmailBody.getNumber()}.
            Дополнительная информация от сервера: Сообщение: ${
              error.message
            }. Код ошибки: ${error.status}`;
        }

        throw new Error(errorMessage);
      }
    );
  }

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
          `Длина строки ответа на бескрылку с номером: ${oneAnswer.questionNumber} (${oneAnswer.body.length}) 
          превышает максимально разрешённый размер в ${MAX_BODY_LENGTH} символов`
        );
      }

      if (oneAnswer.comment && oneAnswer.comment.length > MAX_COMMENT_LENGTH) {
        throw new Error(
          `Длина строки с комментарием к ответу на бескрылку с номером: ${oneAnswer.questionNumber} (${oneAnswer.comment.length}) 
          превышает максимально разрешённый размер в ${MAX_COMMENT_LENGTH} символов`
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
        `Длина строки с темой письма (${this.emailSubject.length}) превышает максимально разрешенный размер в ${MAX_SUBJECT_LENGTH} символов`
      );
    }

    if (this.emailBody && this.emailBody.length > MAX_BODY_LENGTH) {
      throw new Error(
        `Длина содержимого письма (${this.emailBody.length}) превышает максимально разрешенный размер в ${MAX_BODY_LENGTH} символов`
      );
    }
  }
}