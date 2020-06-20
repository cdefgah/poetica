import { AbstractMultiLineDataImporter } from "src/app/utils/AbstractMultilineDataImporter";
import { AnswerDataModel } from "src/app/model/AnswerDataModel";
import { TeamDataModel } from "src/app/model/TeamDataModel";
import { CalculationResult } from "./CalculationResult";
import { EmailShallowValidationService } from "src/app/components/core/validators/EmailShallowValidationService";
import { TeamShallowValidationService } from "src/app/components/core/validators/TeamShallowValidationService";
import { ParsedTeamInfoFromEmailSubject } from "./ParsedTeamInfoFromEmailSubject";
import { HttpClient } from "@angular/common/http";
import { StringBuilder } from "./StringBuilder";

export class EmailBodyParser extends AbstractMultiLineDataImporter {
  private _answers: AnswerDataModel[];
  private _team: TeamDataModel;

  private _emailValidationService: EmailShallowValidationService;
  private _teamValidationService: TeamShallowValidationService;

  private _teamInfoFromSubjectLine: ParsedTeamInfoFromEmailSubject;

  private _httpClient: HttpClient;

  constructor(
    emailBody: string,
    emailValidationService: EmailShallowValidationService,
    teamValidationService: TeamShallowValidationService,
    teamInfoFromSubjectLine: ParsedTeamInfoFromEmailSubject,
    httpClient: HttpClient
  ) {
    super(emailBody);
    this._teamInfoFromSubjectLine = teamInfoFromSubjectLine;
    this._emailValidationService = emailValidationService;
    this._teamValidationService = teamValidationService;
    this._httpClient = httpClient;

    var normalizedEmailBody = this._normalizedSourceString;
    if (normalizedEmailBody.length > emailValidationService.maxBodyLength) {
      this.registerError(
        `Количество символов в содержании письма (${normalizedEmailBody.length}) больше, чем максимально разрешённое для обработки: ${emailValidationService.maxBodyLength}`
      );
      return;
    }
  }

  get answers() {
    return this._answers;
  }

  get team() {
    return this._team;
  }

  public async parseEmailBody(): Promise<void> {
    if (this._answers.length > 0) {
      this._answers = [];
    }

    var firstLineOfAnswersBlockCalcResult: CalculationResult = this.getTheFirstLineOfAnswersBlock();
    if (firstLineOfAnswersBlockCalcResult.errorsPresent) {
      this.registerError(firstLineOfAnswersBlockCalcResult.errorMessage);
      return;
    }

    var firstLineFromAnswersBlock: string =
      firstLineOfAnswersBlockCalcResult.result;

    var teamInfoCalculationResult = this.getTeamFromTheFirstLineOfTheAnswersBlock(
      firstLineFromAnswersBlock
    );
    if (teamInfoCalculationResult.errorsPresent) {
      this.registerError(teamInfoCalculationResult.errorMessage);
      return;
    }
  }

  /**
   * Проматывает указатель итератора на начало блока ответов
   * и возвращает её.
   * @returns первая строка блока ответов, из которой исключён префикс в три звёздочки.
   */
  private getTheFirstLineOfAnswersBlock(): CalculationResult {
    const answersBlockPrefix: string = "***";
    while (this._sourceTextLinesIterator.hasNextLine()) {
      var oneLine = this._sourceTextLinesIterator.nextLine();
      if (oneLine.startsWith(answersBlockPrefix)) {
        return new CalculationResult(
          oneLine.substring(answersBlockPrefix.length + 1).trim(),
          null
        );
      }
    }

    return new CalculationResult(
      null,
      "В теле письма не обнаружен признак начала блока ответов."
    );
  }

  private getTeamFromTheFirstLineOfTheAnswersBlock(
    firstLine: string
  ): CalculationResult {
    var foundTeamTitle: string = "";
    var foundTeamNumber: string = "";
    var errorMessage: string = "";

    if (firstLine.indexOf(",") !== -1) {
      var firstLineParts = firstLine.split(",");
      foundTeamTitle = firstLineParts[0].trim();
      foundTeamNumber = firstLineParts[1].trim();
    } else {
      foundTeamTitle = firstLine;
    }

    foundTeamTitle = EmailBodyParser.removeDoubleQuotations(foundTeamTitle);

    if (!this._teamInfoFromSubjectLine.isEmpty) {
      // совпадение названия команды из темы письма с названием в содержании - не проверяем.
      // так как в теме письма может быть транслит, а в содержании - кириллица.
      // проверяем только номер.
      if (foundTeamNumber != this._teamInfoFromSubjectLine.team.number) {
        errorMessage = `Номер команды в теме письма: ${this._teamInfoFromSubjectLine.team.number} не совпадает с номером команды в содержании письма: ${foundTeamNumber}`;
        return new CalculationResult(null, errorMessage);
      }
    }

    var team: TeamDataModel = TeamDataModel.createTeamByNumberAndTitle(
      foundTeamNumber,
      foundTeamTitle
    );

    return new CalculationResult(team, null);
  }

  private parseAnswersBlock(): void {
    var wholeAnswer: StringBuilder = new StringBuilder();
    var wholeComment: StringBuilder = new StringBuilder();

    const commentPrefix: string = "%";
    var questionNumber: string = "";
    var commentPrefixLocation: number;
    var processedQuestionNumbers = new Set();
    var previousQuestionNumber: number = -1;
    var continueProcessingLines: boolean = true;

    while (
      this._sourceTextLinesIterator.hasNextLine() &&
      continueProcessingLines
    ) {
      var currentLine = this._sourceTextLinesIterator.nextLine();

      if (currentLine.startsWith("#")) {
        // если строка начинается с символа, который знаменует начало ответа
        // сохраняем ранее сформированный ответ и комментарий к нему
        if (questionNumber.length > 0) {
          registerAnswer(this);
        }

        var dotLocation: number = currentLine.indexOf(".");
        if (dotLocation !== -1) {
          questionNumber = currentLine.substring(1, dotLocation).trim();
          if (!EmailBodyParser.isPositiveInteger(questionNumber)) {
            throw new Error(
              `Ошибка в формате блока ответов. Возможно пропущена точка после номера бескрылки. 
              Номер бескрылки должен быть положительным целым числом, а вместо это вот это: '${questionNumber}'`
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

    // ================================ Локальные функции ==============================
    function registerAnswer(currentObjectReference: EmailBodyParser) {
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
          new AnswerDataModel(
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
}
