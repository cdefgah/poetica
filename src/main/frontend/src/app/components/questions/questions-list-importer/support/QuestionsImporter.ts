import { QuestionDataModel } from "src/app/data-model/QuestionDataModel";
import { AbstractMultiLineDataImporter } from "src/app/utils/AbstractMultilineDataImporter";
import { QuestionValidationService } from "src/app/components/core/validators/QuestionValidationService";
import { StringBuilder } from "src/app/utils/StringBuilder";
import { QuestionsListImporterComponent } from "../questions-list-importer.component";
import { FirstQuestionLineParsingResults } from "./FirstQuestionLineParsingResults";
import { debugString } from "src/app/utils/Config";

export class QuestionsImporter extends AbstractMultiLineDataImporter {
  private static readonly sourcePrefix: string = "#S:";
  private static readonly commentNotePrefix: string = "#N:";

  questions: QuestionDataModel[];

  private _allThingsOk: boolean;

  private _expectedQuestionNumber: number;

  private _questionModelValidatorService: QuestionValidationService;

  constructor(
    importerComponentReference: QuestionsListImporterComponent,
    sourceText: string,
    questionModelValidatorService: QuestionValidationService,
    onSuccess: Function,
    onFailure: Function
  ) {
    super(sourceText, onSuccess, onFailure);
    this._questionModelValidatorService = questionModelValidatorService;
    this._parentComponentObject = importerComponentReference;
  }

  public doImport() {
    this._allThingsOk = true;
    this.questions = [];
    this._expectedQuestionNumber = -1;

    var question: QuestionDataModel;
    while ((question = this.nextQuestion()) != null) {
      this.questions.push(question);
    }

    if (this._allThingsOk) {
      this._onSuccess(this._parentComponentObject, this.questions);
    }
  }

  private nextQuestion(): QuestionDataModel {
    if (!this._sourceTextLinesIterator.hasNextLine()) {
      return null;
    }

    var firstQuestionLine: string = this._sourceTextLinesIterator.nextLine();

    var firstQuestionLineParsingResults: FirstQuestionLineParsingResults = this.parseFirstQuestionLine(
      firstQuestionLine
    );

    if (firstQuestionLineParsingResults == null) {
      return null;
    }

    var questionBodyBuilder: StringBuilder = new StringBuilder();
    var processingLine: string;
    var nextSegmentDetected: boolean = false;

    // загружаем непосредственный текст задания
    while (this._sourceTextLinesIterator.hasNextLine()) {
      processingLine = this._sourceTextLinesIterator.nextLine();
      if (QuestionsImporter.hasControlPrefix(processingLine)) {
        nextSegmentDetected = true;
        break;
      }

      questionBodyBuilder.addString(processingLine);
    }

    var rtfmMessage: string =
      "Ознакомьтесь, пожалуйста, с требованиями к формату текста.";

    if (!nextSegmentDetected) {
      this._allThingsOk = false;
      this._onFailure(
        this._parentComponentObject,
        `После блока с текстом задания номер ${firstQuestionLineParsingResults.externalNumber} ожидался блок с информацией об источнике для этого задания. Но текст внезапно кончился. ${rtfmMessage}`
      );
      return;
    }

    if (!QuestionsImporter.isQuestionSourceLine(processingLine)) {
      this._allThingsOk = false;
      this._onFailure(
        this._parentComponentObject,
        `После блока с текстом задания номер ${firstQuestionLineParsingResults.externalNumber} ожидался блок с информацией об источнике для этого задания. Но вместо него оказалась вот эта строка: ${processingLine}. ${rtfmMessage}`
      );
      return;
    }

    var questionSourceBody: string = processingLine.substring(
      QuestionsImporter.sourcePrefix.length
    );

    // загружаем информацию об источнике для задания
    nextSegmentDetected = false;
    while (this._sourceTextLinesIterator.hasNextLine()) {
      processingLine = this._sourceTextLinesIterator.nextLine();

      if (QuestionsImporter.hasControlPrefix(processingLine)) {
        nextSegmentDetected = true;
        break;
      }

      questionSourceBody =
        questionSourceBody + QuestionsImporter.newline + processingLine;
    }

    var questionCommentNoteBody: string = "";

    if (nextSegmentDetected) {
      if (QuestionsImporter.isQuestionCommentNoteLine(processingLine)) {
        // если начался блок комментария к заданию
        questionCommentNoteBody = processingLine.substring(
          QuestionsImporter.commentNotePrefix.length
        );

        // загружаем тело комментариев к заданию
        var textBlockContinuesFurther: boolean = false;
        while (this._sourceTextLinesIterator.hasNextLine()) {
          processingLine = this._sourceTextLinesIterator.nextLine();

          if (QuestionsImporter.hasControlPrefix(processingLine)) {
            textBlockContinuesFurther = true;
            break;
          }

          questionCommentNoteBody =
            questionCommentNoteBody +
            QuestionsImporter.newline +
            processingLine;
        }

        // отматываем номер строки на одну строку назад,
        // так как мы зацепили следующий вопрос
        if (textBlockContinuesFurther) {
          this._sourceTextLinesIterator.stepIndexBack();
        }
      } else {
        // следующий вопрос

        // отматываем номер строки на одну строку назад,
        // так как мы зацепили следующий вопрос
        this._sourceTextLinesIterator.stepIndexBack();
      }
    }

    if (questionBodyBuilder.length() == 0) {
      this._allThingsOk = false;
      this._onFailure(
        this._parentComponentObject,
        `Содержимое не указано для задания с номером ${firstQuestionLineParsingResults.externalNumber}.`
      );
      return;
    }

    // проверяем ограничения на длину полей
    if (
      questionBodyBuilder.length() >
      this._questionModelValidatorService.maxBodyLength
    ) {
      this._allThingsOk = false;
      this._onFailure(
        this._parentComponentObject,
        `Размер блока текста с содержанием задания ${
          firstQuestionLineParsingResults.externalNumber
        } составляет ${questionBodyBuilder.length()} символов и превышает максимальный разрешённый размер в ${
          this._questionModelValidatorService.maxBodyLength
        } символов`
      );
      return;
    }

    if (
      questionSourceBody.length >
      this._questionModelValidatorService.maxSourceLength
    ) {
      this._allThingsOk = false;
      this._onFailure(
        this._parentComponentObject,
        `Размер блока текста с информацией об источнике задания ${firstQuestionLineParsingResults.externalNumber} составляет ${questionSourceBody.length} символов и превышает максимальный разрешённый размер в ${this._questionModelValidatorService.maxSourceLength} символов`
      );
      return;
    }

    if (
      questionCommentNoteBody.length >
      this._questionModelValidatorService.maxCommentLength
    ) {
      this._allThingsOk = false;
      this._onFailure(
        this._parentComponentObject,
        `Размер блока текста с комментарием к заданию с номером ${firstQuestionLineParsingResults.externalNumber} составляет ${questionCommentNoteBody.length} символов и превышает максимальный разрешённый размер в ${this._questionModelValidatorService.maxCommentLength} символов`
      );
      return;
    }

    // формируем вопрос
    var question: QuestionDataModel = QuestionDataModel.createQuestion();
    question.externalNumber = firstQuestionLineParsingResults.externalNumber;
    question.title = firstQuestionLineParsingResults.questionTitle;
    question.lowestInternalNumber =
      firstQuestionLineParsingResults.lowestInternalNumber;
    question.highestInternalNumber =
      firstQuestionLineParsingResults.highestInternalNumber;
    question.graded = firstQuestionLineParsingResults.isGraded;

    question.body = questionBodyBuilder.toString();
    question.source = questionSourceBody;
    question.comment = questionCommentNoteBody;

    return question;
  }

  /**
   * Загружает тело того или иного сегмента до строки с control prefix.
   * @param firstSegmentLine первая строка загружаемого сегмента.
   * @returns текст с телом сегмента.
   */
  private loadSegmentBody(firstSegmentLine: string): string {
    var stringBuilder: StringBuilder = new StringBuilder();
    stringBuilder.addString(firstSegmentLine);

    while (this._sourceTextLinesIterator.hasNextLine()) {
      var processingLine: string = this._sourceTextLinesIterator.nextLine();

      if (QuestionsImporter.hasControlPrefix(processingLine)) {
        // если взяли строку с control prefix, откатываемся назад на одну строку
        this._sourceTextLinesIterator.stepIndexBack();
        // и прекращаем цикл
        break;
      }

      stringBuilder.addString(processingLine);
    }

    return stringBuilder.toString();
  }

  /**
   * Возвращает true, если строка начинается с контрольного префикса #.
   * @param sourceStringLine строка к проверке.
   * @returns true если строка начинается с контрольного префикса #.
   */
  private static hasControlPrefix(sourceStringLine: string): boolean {
    return sourceStringLine.startsWith("#");
  }

  private static isQuestionSourceLine(sourceStringLine: string): boolean {
    return sourceStringLine
      .toUpperCase()
      .startsWith(QuestionsImporter.sourcePrefix);
  }

  private static isQuestionCommentNoteLine(sourceStringLine: string): boolean {
    return sourceStringLine
      .toUpperCase()
      .startsWith(QuestionsImporter.commentNotePrefix);
  }

  /**
   * Извлекает номер задания из строки.
   * @param sourceStringLine строка для обработки.
   * @returns блок данных с информацией о номере, зачётности задания, и заголовок задания.
   */
  private parseFirstQuestionLine(
    sourceStringLine: string
  ): FirstQuestionLineParsingResults {
    if (!QuestionsImporter.hasControlPrefix(sourceStringLine)) {
      this._allThingsOk = false;
      this._onFailure(
        this._parentComponentObject,
        `Первым символом строки ожидался символ #. Строка: ${sourceStringLine}`
      );
      return;
    }

    var colonSymbolPosition: number = sourceStringLine.indexOf(":");

    if (colonSymbolPosition == -1) {
      this._allThingsOk = false;
      this._onFailure(
        this._parentComponentObject,
        `В начале строки должен быть символ двоеточия. Строка: ${sourceStringLine}`
      );
      return null;
    }

    var parsingResult: FirstQuestionLineParsingResults = new FirstQuestionLineParsingResults();
    parsingResult.isGraded = true;

    var numberBodyString: string = sourceStringLine
      .substring(1, colonSymbolPosition)
      .trim();

    var openingParenPosition = numberBodyString.indexOf("(");
    if (openingParenPosition !== -1) {
      // внезачётное задание
      parsingResult.isGraded = false;

      var closingParenPosition = numberBodyString.indexOf(
        ")",
        openingParenPosition
      );

      if (closingParenPosition === -1) {
        this._allThingsOk = false;
        this._onFailure(
          this._parentComponentObject,
          `В строке представлена открывающая скобка, но нет закрывающей для неё. Строка: ${sourceStringLine}`
        );
        return null;
      }

      numberBodyString = numberBodyString.substring(
        openingParenPosition + 1,
        closingParenPosition
      );
    }

    parsingResult.externalNumber = numberBodyString;

    debugString("numberBodyString = " + numberBodyString);

    const hypen: string = "-";
    if (numberBodyString.indexOf(hypen) === -1) {
      // одиночный номер

      // валидация номера
      if (!QuestionsImporter.isZeroOrPositiveInteger(numberBodyString)) {
        this._allThingsOk = false;
        this._onFailure(
          this._parentComponentObject,
          `Номер задания может быть либо нулём, либо положительным целым числом. Строка: ${sourceStringLine}`
        );
        return null;
      }

      parsingResult.lowestInternalNumber = parseInt(numberBodyString);
      parsingResult.highestInternalNumber = parsingResult.lowestInternalNumber;
    } else {
      // составной номер
      var internalNumberParts: string[] = numberBodyString.split("-");
      var expectedInternalNumber: number = -1;
      debugString("Processing compound number: start");

      for (var oneInternalNumberString of internalNumberParts) {
        // валидация числового формата номера
        var normalizedOneInternalNumberString: string = oneInternalNumberString.trim();
        debugString(
          `normalizedOneInternalNumberString: ${normalizedOneInternalNumberString}`
        );

        if (
          !QuestionsImporter.isZeroOrPositiveInteger(
            normalizedOneInternalNumberString
          )
        ) {
          debugString(
            `${normalizedOneInternalNumberString} is not a zero nor a positive integer number!`
          );

          this._allThingsOk = false;
          this._onFailure(
            this._parentComponentObject,
            `Номер задания может быть либо нулём, либо положительным целым числом. Но вы передали значение ${oneInternalNumberString} в составном номере ${numberBodyString}. Строка: ${sourceStringLine}`
          );
          return null;
        }

        debugString(
          `${normalizedOneInternalNumberString} is acceptable number, zero or positive integer.`
        );

        var oneInternalNumber: number = parseInt(
          normalizedOneInternalNumberString
        );

        if (expectedInternalNumber !== -1) {
          // если это не первая итерация цикла, то проверяем, чтобы номера в составном номере шли по возрастанию
          if (oneInternalNumber !== expectedInternalNumber) {
            this._allThingsOk = false;
            this._onFailure(
              this._parentComponentObject,
              `Внутри составного номера номера должны идти друг за другом по возрастанию. Это правило не соблюдается для составного номера ${numberBodyString}. Строка: ${sourceStringLine}`
            );
            return null;
          }
        }

        // формируем следующий ожидаемый номер внутри составного номера
        expectedInternalNumber = oneInternalNumber + 1;
      }

      parsingResult.lowestInternalNumber = parseInt(internalNumberParts[0]);
      parsingResult.highestInternalNumber = parseInt(
        internalNumberParts[internalNumberParts.length - 1]
      );

      debugString("Processing compound number: end");
    }

    if (this._expectedQuestionNumber !== -1) {
      // если это не первый вопрос, проверяем порядок следования номеров заданий
      if (parsingResult.lowestInternalNumber !== this._expectedQuestionNumber) {
        this._allThingsOk = false;
        this._onFailure(
          this._parentComponentObject,
          `Номера заданий должны идти в порядке возрастания друг за другом. Но это правило нарушено на строке: ${sourceStringLine}`
        );
        return null;
      }
    }

    this._expectedQuestionNumber = parsingResult.highestInternalNumber + 1;

    parsingResult.questionTitle = sourceStringLine
      .substring(colonSymbolPosition + 1)
      .trim();

    return parsingResult;
  }
}
