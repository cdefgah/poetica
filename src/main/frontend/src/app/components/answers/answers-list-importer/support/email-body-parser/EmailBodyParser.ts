import { AbstractMultiLineDataImporter } from "src/app/utils/AbstractMultilineDataImporter";
import { AnswerDataModel } from "src/app/model/AnswerDataModel";
import { EmailBodyParserParameters } from "./EmailBodyParserParameters";
import { HttpClient } from "@angular/common/http";
import { TeamDataModel } from "src/app/model/TeamDataModel";
import { EmailValidationService } from "src/app/components/core/validators/EmailValidationService";
import { TeamValidationService } from "src/app/components/core/validators/TeamValidationService";
import { AnswerValidationService } from "src/app/components/core/validators/AnswerValidationService";
import { CalculationResult } from "../CalculationResult";
import { StringBuilder } from "../../../../../utils/StringBuilder";

export class EmailBodyParser extends AbstractMultiLineDataImporter {
  private _answers: AnswerDataModel[];
  private _team: TeamDataModel;

  private _emailValidationService: EmailValidationService;
  private _teamValidationService: TeamValidationService;
  private _answerValidationService: AnswerValidationService;

  private _teamFromEmailSubject: TeamDataModel;

  private _httpClient: HttpClient;
  private _roundNumber: string;

  constructor(parameters: EmailBodyParserParameters) {
    super(parameters.emailBody);
    this._teamFromEmailSubject = parameters.teamFromEmailSubject;
    this._roundNumber = parameters.roundNumber;

    this._emailValidationService = parameters.emailValidationService;
    this._teamValidationService = parameters.teamValidationService;
    this._answerValidationService = parameters.answerValidationService;
    this._httpClient = parameters.httpClient;
  }

  get answers() {
    return this._answers;
  }

  get team() {
    return this._team;
  }

  public async parseEmailBody(): Promise<void> {
    this._answers = [];

    var firstLineOfAnswersBlockCalcResult: CalculationResult = this.getTheFirstLineOfAnswersBlock();
    if (firstLineOfAnswersBlockCalcResult.errorsPresent) {
      //  this.registerError(firstLineOfAnswersBlockCalcResult.errorMessage);
      return;
    }

    var firstLineFromAnswersBlock: string =
      firstLineOfAnswersBlockCalcResult.result;

    var teamInfoCalculationResult = this.getTeamFromTheFirstLineOfTheAnswersBlock(
      firstLineFromAnswersBlock
    );

    if (teamInfoCalculationResult.errorsPresent) {
      //  this.registerError(teamInfoCalculationResult.errorMessage);
      return;
    } else {
      this._team = teamInfoCalculationResult.result;
    }

    this.parseAnswersBlock();
    // if (this.errorsPresent) {
    //   return;
    // }

    console.log(" ================ PARSING RESULT START==============");
    this.answers.forEach((oneAnswer) => {
      console.log("-----------------------------------");
      console.log("Номер бескрылки: " + oneAnswer.questionNumber);
      console.log("Тело ответа: " + oneAnswer.body);
      console.log("Комментарий: " + oneAnswer.comment);
      console.log("-----------------------------------");
    });
    console.log(" ================ PARSING RESULT: END ==============");
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
    if (foundTeamTitle.length == 0) {
      errorMessage = "В содержании письма не указано название команды";
      return new CalculationResult(null, errorMessage);
    }

    if (this._teamFromEmailSubject) {
      // совпадение названия команды из темы письма с названием в содержании - не проверяем.
      // так как в теме письма может быть транслит, а в содержании - кириллица.
      // проверяем только номер.
      if (foundTeamNumber != this._teamFromEmailSubject.number) {
        errorMessage = `Номер команды в теме письма: ${this._teamFromEmailSubject.number} не совпадает с номером команды в содержании письма: ${foundTeamNumber}`;
        return new CalculationResult(null, errorMessage);
      }
    }

    var teamNumberValidationMessage: string = this._teamValidationService.checkTeamNumberAndGetValidationMessage(
      foundTeamNumber
    );
    if (teamNumberValidationMessage.length > 0) {
      return new CalculationResult(null, teamNumberValidationMessage);
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

          // if (this.errorsPresent) {
          //   return;
          // }
        }

        var dotLocation: number = currentLine.indexOf(".");
        if (dotLocation !== -1) {
          questionNumber = currentLine.substring(1, dotLocation).trim();
          if (!EmailBodyParser.isPositiveInteger(questionNumber)) {
            // this
            //   .registerError(`Ошибка в формате блока ответов. Возможно пропущена точка после номера бескрылки.
            // Номер бескрылки должен быть положительным целым числом, а вместо это вот это: '${questionNumber}'`);
            return;
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
          // this.registerError(
          //   `Неверный формат блока ответов. Нет ожидаемой точки при наличии символа # в строке: '${currentLine}'`
          // );
          return;
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
      // this.registerError(
      //   "В содержании письма не представлено ни одного ответа."
      // );
      return;
    }
    // ================================ Локальные функции ==============================
    function registerAnswer(currentObjectReference: EmailBodyParser) {
      if (processedQuestionNumbers.has(questionNumber)) {
        // currentObjectReference.registerError(
        //   `Повторяющийся номер бескрылки в блоке ответов: ${questionNumber}`
        // );
        return;
      }

      if (previousQuestionNumber != -1) {
        if (Number(questionNumber) <= previousQuestionNumber) {
          // currentObjectReference.registerError(
          //   `Номера бескрылок в блоке ответов должны идти в порядке возрастания.
          //   А у нас после номера: ${previousQuestionNumber} идёт номер: ${questionNumber}`
          // );
          return;
        }

        processedQuestionNumbers.add(questionNumber);
      }

      previousQuestionNumber = Number(questionNumber);

      // в ответе может быть просто номер с точкой
      // но не быть ответа (placeholder для читабельности),
      // в таком случае пустой ответ не регистрируем а пропускаем
      if (wholeAnswer.length() > 0) {
        var answerBody: string = wholeAnswer.toString();
        if (
          answerBody.length >
          currentObjectReference._answerValidationService.maxBodyLength
        ) {
          // currentObjectReference.registerError(
          //   `Тело ответа #${questionNumber} содержит больше символов (${answerBody.length}), чем может быть обработано для одного ответа: ${currentObjectReference._answerValidationService.maxBodyLength}`
          // );
          return;
        }

        var answerComment: string = wholeComment.toString();
        if (
          answerComment.length >
          currentObjectReference._answerValidationService.maxCommentLength
        ) {
          // currentObjectReference.registerError(
          //   `Комментарий к ответу #${questionNumber} содержит больше символов (${answerComment.length}), чем может быть обработано для комментария к ответу: ${currentObjectReference._answerValidationService.maxCommentLength}`
          // );
          return;
        }

        var answerRecord: AnswerDataModel = new AnswerDataModel(
          questionNumber,
          answerBody,
          answerComment
        );

        if (
          currentObjectReference._roundNumber &&
          currentObjectReference._roundNumber.length > 0
        ) {
          answerRecord.roundNumber = parseInt(
            currentObjectReference._roundNumber
          );
        }

        currentObjectReference.answers.push(answerRecord);
      }

      questionNumber = "";
      wholeAnswer.reset();
      wholeComment.reset();
    }
    // =====================================================================================================
  }
}
