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
import { EmailBodyParsingResult } from "./EmailBodyParsingResult";
import { debugString } from "src/app/utils/Config";

export class EmailBodyParser extends AbstractMultiLineDataImporter {
  private _team: TeamDataModel;

  private _emailValidationService: EmailValidationService;
  private _teamValidationService: TeamValidationService;
  private _answerValidationService: AnswerValidationService;

  private _teamFromEmailSubject: TeamDataModel;
  private _roundNumber: string;

  private _httpClient: HttpClient;

  constructor(
    parameters: EmailBodyParserParameters,
    onSuccess: Function,
    onFailure: Function
  ) {
    super(parameters.emailBody, onSuccess, onFailure);
    this._parentComponentObject = parameters.parentComponentObject;
    this._teamFromEmailSubject = parameters.teamFromEmailSubject;
    this._roundNumber = parameters.roundNumber;

    this._emailValidationService = parameters.emailValidationService;
    this._teamValidationService = parameters.teamValidationService;
    this._answerValidationService = parameters.answerValidationService;
    this._httpClient = parameters.httpClient;
  }

  public parse(): void {
    var emailBodyValidationResult: string = this._emailValidationService.validateEmailBody(
      this.normalizedSourceString
    );
    if (emailBodyValidationResult.length > 0) {
      this._onFailure(this._parentComponentObject, emailBodyValidationResult);
      return;
    }

    var firstLineOfAnswersBlockCalcResult: CalculationResult = this.getTheFirstLineOfAnswersBlock();
    if (firstLineOfAnswersBlockCalcResult.errorsPresent) {
      this._onFailure(
        this._parentComponentObject,
        firstLineOfAnswersBlockCalcResult.errorMessage
      );
      return;
    }

    var firstLineFromAnswersBlock: string =
      firstLineOfAnswersBlockCalcResult.result;

    var teamInfoCalculationResult = this.getTeamFromTheFirstLineOfTheAnswersBlock(
      firstLineFromAnswersBlock
    );

    if (teamInfoCalculationResult.errorsPresent) {
      this._onFailure(
        this._parentComponentObject,
        teamInfoCalculationResult.errorMessage
      );
      return;
    } else {
      this._team = teamInfoCalculationResult.result;

      if (this._teamFromEmailSubject) {
        if (this._teamFromEmailSubject.number != this._team.number) {
          this._onFailure(
            this._parentComponentObject,
            `Номер команды в содержимом письма ${this._team.number} отличается от номера команды в теме письма: ${this._teamFromEmailSubject.number}`
          );
          return;
        }
      }
    }

    var parsingResult: CalculationResult = this.parseAnswersBlock();
    if (parsingResult.errorsPresent) {
      this._onFailure(this._parentComponentObject, parsingResult.errorMessage);
      return;
    }

    // и в финале всего запускаем проверку корректности данных на основе ответа сервера
    this.doValidationWithServerData(this, parsingResult.result);
  }

  private doValidationWithServerData(
    parserObjectReference: EmailBodyParser,
    loadedAnswers: AnswerDataModel[]
  ) {
    // сперва проверяем корректность названия команды из письма
    var teamNumber: string = parserObjectReference._team.number;
    const teamValidationUrl: string = `/teams/numbers/${teamNumber}`;
    var importingTeamTitle = parserObjectReference._team.title;
    parserObjectReference._httpClient.get(teamValidationUrl).subscribe(
      (data: Map<string, any>) => {
        var teamObjectfromTheServer: TeamDataModel = TeamDataModel.createTeamByMapOfValues(
          data
        );
        var loadedTeamTitle: string = teamObjectfromTheServer.title;
        if (
          loadedTeamTitle.toLowerCase() !== importingTeamTitle.toLowerCase()
        ) {
          parserObjectReference._onFailure(
            parserObjectReference._parentComponentObject,
            `В базе данных команда с номером: ${teamNumber} записана как '${loadedTeamTitle}'. 
            А в письме передано название команды: '${importingTeamTitle}'`
          );
          return;
        } else {
          // название команды в письме и в базе совпало

          // теперь прописываем полученный идентификатор команды в соответствующий объект
          parserObjectReference._team.id = teamObjectfromTheServer.id;

          // получаем максимальный номер загружаемого ответа
          var maxQuestionNumberInAnswers: number =
            loadedAnswers[loadedAnswers.length - 1].questionNumber;

          // теперь проверяем корректность максимального номера в ответах
          const maxQuestionNumberValidationUrl: string =
            "/questions/max-number";
          parserObjectReference._httpClient
            .get(maxQuestionNumberValidationUrl)
            .subscribe(
              (maxNumberOfRegisteredQuestion: number) => {
                if (
                  maxNumberOfRegisteredQuestion < maxQuestionNumberInAnswers
                ) {
                  parserObjectReference._onFailure(
                    parserObjectReference._parentComponentObject,
                    `Максимальный номер задания, зарегистрированного в базе данных равен: ${maxNumberOfRegisteredQuestion}. 
                Но среди импортируемых ответов представлен ответ на задание с номером: ${maxQuestionNumberInAnswers}`
                  );
                  return;
                } else {
                  // все проверки пройдены, ура!
                  var emailBodyParsingResult: EmailBodyParsingResult = new EmailBodyParsingResult(
                    parserObjectReference._team,
                    loadedAnswers
                  );

                  parserObjectReference._onSuccess(
                    parserObjectReference._parentComponentObject,
                    emailBodyParsingResult
                  );
                  return;
                }
              },
              (error) => {
                parserObjectReference._onFailure(
                  parserObjectReference._parentComponentObject,
                  `Не удалось получить информацию из базы данных о максимальном номере загруженного задания. 
                Дополнительная информация от сервера: Сообщение: ${error.message}. Код ошибки: ${error.status}`
                );
                return;
              }
            );
        }
      },
      (error) => {
        const NOT_FOUND_STATUS: number = 404;
        var errorMessage: string;
        if (error.status == NOT_FOUND_STATUS) {
          errorMessage = `Не удалось найти в базе данных команду с номером: ${teamNumber}`;
        } else {
          errorMessage = `Не удалось получить информацию из базы данных о команде с номером: ${teamNumber}.
            Дополнительная информация от сервера: Сообщение: ${error.message}. Код ошибки: ${error.status}`;
        }

        parserObjectReference._onFailure(
          parserObjectReference._parentComponentObject,
          errorMessage
        );
        return;
      }
    );
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

  private parseAnswersBlock(): CalculationResult {
    var answers: AnswerDataModel[] = [];

    var wholeAnswer: StringBuilder = new StringBuilder();
    var wholeComment: StringBuilder = new StringBuilder();

    const commentPrefix: string = "%";
    var questionNumber: string = "";
    var commentPrefixLocation: number;
    var processedQuestionNumbers = new Set();
    var previousQuestionNumber: number = -1;
    var continueProcessingLines: boolean = true;
    var answerRegistrationResult: CalculationResult;

    while (
      this._sourceTextLinesIterator.hasNextLine() &&
      continueProcessingLines
    ) {
      var currentLine = this._sourceTextLinesIterator.nextLine();

      if (currentLine.startsWith("#")) {
        // если строка начинается с символа, который знаменует начало ответа
        // сохраняем ранее сформированный ответ и комментарий к нему
        if (questionNumber.length > 0) {
          answerRegistrationResult = registerAnswer(this);
          if (answerRegistrationResult.errorsPresent) {
            return answerRegistrationResult;
          }
        }

        var dotLocation: number = currentLine.indexOf(".");
        if (dotLocation !== -1) {
          questionNumber = currentLine.substring(1, dotLocation).trim();
          if (!EmailBodyParser.isPositiveInteger(questionNumber)) {
            return new CalculationResult(
              null,
              `Ошибка в формате блока ответов. Возможно пропущена точка после номера бескрылки. Номер бескрылки должен быть положительным целым числом, а вместо это вот это: '${questionNumber}'`
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
          return new CalculationResult(
            null,
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
      answerRegistrationResult = registerAnswer(this);
      if (answerRegistrationResult.errorsPresent) {
        return answerRegistrationResult;
      }
    }

    if (answers.length == 0) {
      return new CalculationResult(
        null,
        "В содержании письма не представлено ни одного ответа."
      );
    }

    // возвращаем список ответов
    return new CalculationResult(answers, "");

    // ================================ Локальные функции ==============================
    /**
     * Регистрирует ответ.
     * @param currentObjectReference ссылка на текущий объект парсера.
     */
    function registerAnswer(
      currentObjectReference: EmailBodyParser
    ): CalculationResult {
      if (processedQuestionNumbers.has(questionNumber)) {
        return new CalculationResult(
          null,
          `Повторяющийся номер бескрылки в блоке ответов: ${questionNumber}`
        );
      }

      if (previousQuestionNumber != -1) {
        if (Number(questionNumber) <= previousQuestionNumber) {
          return new CalculationResult(
            null,
            `Номера бескрылок в блоке ответов должны идти в порядке возрастания. А у нас после номера: ${previousQuestionNumber} идёт номер: ${questionNumber}`
          );
        }

        processedQuestionNumbers.add(questionNumber);
      }

      var answerRecord: AnswerDataModel = AnswerDataModel.emptyAnswer;
      previousQuestionNumber = Number(questionNumber);

      // в ответе может быть просто номер с точкой
      // но не быть ответа (placeholder для читабельности),
      // в таком случае пустой ответ не регистрируем а пропускаем
      if (wholeAnswer.length() > 0) {
        var answerBody: string = wholeAnswer.toString();
        var answerBodyValidationMessage: string = currentObjectReference._answerValidationService.validateAnswerBody(
          answerBody,
          questionNumber
        );
        if (answerBodyValidationMessage.length > 0) {
          return new CalculationResult(null, answerBodyValidationMessage);
        }

        var answerComment: string = wholeComment.toString();
        var answerCommentValidationMessage: string = currentObjectReference._answerValidationService.validateAnswerComment(
          answerComment,
          questionNumber
        );
        if (answerCommentValidationMessage.length > 0) {
          return new CalculationResult(null, answerCommentValidationMessage);
        }

        answerRecord = new AnswerDataModel(
          parseInt(questionNumber),
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

        answers.push(answerRecord);
      }

      questionNumber = "";

      debugString("Whole answer before reset: " + wholeAnswer.toString());
      wholeAnswer.reset();
      debugString("Whole answer after reset: " + wholeAnswer.toString());

      debugString("Whole comment before reset: " + wholeComment.toString());
      wholeComment.reset();
      debugString("Whole comment after reset: " + wholeComment.toString());

      return new CalculationResult(answerRecord, "");
    }
    // =====================================================================================================
  }
}
