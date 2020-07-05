import { QuestionDataModel } from "src/app/model/QuestionDataModel";
import { AbstractMultiLineDataImporter } from "src/app/utils/AbstractMultilineDataImporter";
import { QuestionValidationService } from "src/app/components/core/validators/QuestionValidationService";
import { StringBuilder } from "src/app/utils/StringBuilder";

export class QuestionsImporter extends AbstractMultiLineDataImporter {
  private static readonly sourcePrefix: string = "#S:";
  private static readonly commentNotePrefix: string = "#N:";

  amountOfGradedQuestions: number;

  expectedQuestionNumber: number;

  questions: QuestionDataModel[];

  private questionModelValidatorService: QuestionValidationService;

  constructor(
    sourceText: string,
    questionModelValidatorService: QuestionValidationService
  ) {
    // TODO - потом переделать на onSuccess и onFailure по аналогии с импортом ответов
    super(sourceText, null, null);
    this.expectedQuestionNumber = 1;
    this.questionModelValidatorService = questionModelValidatorService;
  }

  public doImport() {
    this.questions = [];
    var question: QuestionDataModel;
    while ((question = this.nextQuestion()) != null) {
      this.questions.push(question);
    }
  }

  private nextQuestion(): QuestionDataModel {
    if (!this._sourceTextLinesIterator.hasNextLine()) {
      return null;
    }

    var firstQuestionLine: string = this._sourceTextLinesIterator.nextLine();
    var questionNumber: number = this.extractQuestionNumber(firstQuestionLine);

    if (questionNumber != this.expectedQuestionNumber) {
      throw new Error(
        `Ожидался номер задания: ${this.expectedQuestionNumber}, но передан: ${questionNumber} в строке "${firstQuestionLine}"`
      );
    }

    this.expectedQuestionNumber = this.expectedQuestionNumber + 1;
    var numberPrefix: string = `#${questionNumber}:`;
    var numberPrefixLength: number = numberPrefix.length;

    var questionBodyBuilder: StringBuilder = new StringBuilder();
    questionBodyBuilder.addString(
      firstQuestionLine.substring(numberPrefixLength)
    );
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
      throw new Error(
        `После блока с текстом задания номер ${questionNumber} ожидался блок с информацией об источнике для этого задания. Но текст внезапно кончился. ${rtfmMessage}`
      );
    }

    if (!QuestionsImporter.isQuestionSourceLine(processingLine)) {
      throw new Error(
        `После блока с текстом задания номер ${questionNumber} ожидался блок с информацией об источнике для этого задания. Но вместо него оказалась вот эта строка: ${processingLine}. ${rtfmMessage}`
      );
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

    // проверяем ограничения на длину полей

    if (
      questionBodyBuilder.length() >
      this.questionModelValidatorService.maxBodyLength
    ) {
      throw new Error(
        `Размер блока текста с содержанием задания ${questionNumber} составляет ${questionBodyBuilder.length()} символов и превышает максимальный разрешённый размер в ${
          this.questionModelValidatorService.maxBodyLength
        } символов`
      );
    }

    if (
      questionSourceBody.length >
      this.questionModelValidatorService.maxSourceLength
    ) {
      throw new Error(
        `Размер блока текста с информацией об источнике задания ${questionNumber} составляет ${questionSourceBody.length} символов и превышает максимальный разрешённый размер в ${this.questionModelValidatorService.maxSourceLength} символов`
      );
    }

    if (
      questionCommentNoteBody.length >
      this.questionModelValidatorService.maxCommentLength
    ) {
      throw new Error(
        `Размер блока текста с комментарием к заданию с номером ${questionNumber} составляет ${questionCommentNoteBody.length} символов и превышает максимальный разрешённый размер в ${this.questionModelValidatorService.maxCommentLength} символов`
      );
    }

    // формируем вопрос
    var question: QuestionDataModel = QuestionDataModel.createQuestion();
    question.number = questionNumber;
    question.graded = questionNumber <= this.amountOfGradedQuestions;
    question.body = questionBodyBuilder.toString();
    question.source = questionSourceBody;
    question.comment = questionCommentNoteBody;

    return question;
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
    return sourceStringLine.startsWith(QuestionsImporter.sourcePrefix);
  }

  private static isQuestionCommentNoteLine(sourceStringLine: string): boolean {
    return sourceStringLine.startsWith(QuestionsImporter.commentNotePrefix);
  }

  /**
   * Извлекает номер задания из строки.
   * @param sourceStringLine строка для обработки.
   * @returns номер задания.
   */
  private extractQuestionNumber(sourceStringLine: string): number {
    if (!QuestionsImporter.hasControlPrefix(sourceStringLine)) {
      throw new Error(
        `Первым символом строки ожидался символ #. Строка: ${sourceStringLine}`
      );
    }

    var colonSymbolPosition: number = sourceStringLine.indexOf(":");

    if (colonSymbolPosition == -1) {
      throw new Error(
        `В начале строки должен быть символ двоеточия. Строка: ${sourceStringLine}`
      );
    }

    var numberString: string = sourceStringLine.substring(
      1,
      colonSymbolPosition
    );

    if (QuestionsImporter.isZeroOrPositiveInteger(numberString)) {
      return Number(numberString);
    } else {
      throw new Error(
        `Номер задания может быть нулём либо целым положительным числом, а вы передали: ${numberString} в строке: ${sourceStringLine}`
      );
    }
  }
}
