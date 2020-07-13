import { QuestionDataModel } from "src/app/data-model/QuestionDataModel";
import { AbstractMultiLineDataImporter } from "src/app/utils/AbstractMultilineDataImporter";
import { QuestionValidationService } from "src/app/components/core/validators/QuestionValidationService";
import { StringBuilder } from "src/app/utils/StringBuilder";
import { QuestionsListImporterComponent } from "../questions-list-importer.component";

export class QuestionsImporter extends AbstractMultiLineDataImporter {
  private static readonly sourcePrefix: string = "#S:";
  private static readonly commentNotePrefix: string = "#N:";

  questions: QuestionDataModel[];

  private _questionModelValidatorService: QuestionValidationService;

  // TODO Все задания зачётные по умолчанию.
  // Для внезачётных заданий номер берется в круглые скобки (без символа #).
  // То есть
  // #4: - зачётное задание
  // #(4): - внезачётное задание
  // Зачётная двукрылка с оценкой по очку за каждое крыло, выглядит вот так:
  // #4-5:
  // Внезачётная двукрылка с оценками по очку за каждое крыло, выглядит вот так:
  // #(4-5):
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
      this._onFailure(
        this._parentComponentObject,
        `После блока с текстом задания номер ${questionNumber} ожидался блок с информацией об источнике для этого задания. Но текст внезапно кончился. ${rtfmMessage}`
      );
      return;
    }

    if (!QuestionsImporter.isQuestionSourceLine(processingLine)) {
      this._onFailure(
        this._parentComponentObject,
        `После блока с текстом задания номер ${questionNumber} ожидался блок с информацией об источнике для этого задания. Но вместо него оказалась вот эта строка: ${processingLine}. ${rtfmMessage}`
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

    // проверяем ограничения на длину полей
    if (
      questionBodyBuilder.length() >
      this._questionModelValidatorService.maxBodyLength
    ) {
      this._onFailure(
        this._parentComponentObject,
        `Размер блока текста с содержанием задания ${questionNumber} составляет ${questionBodyBuilder.length()} символов и превышает максимальный разрешённый размер в ${
          this._questionModelValidatorService.maxBodyLength
        } символов`
      );
      return;
    }

    if (
      questionSourceBody.length >
      this._questionModelValidatorService.maxSourceLength
    ) {
      this._onFailure(
        this._parentComponentObject,
        `Размер блока текста с информацией об источнике задания ${questionNumber} составляет ${questionSourceBody.length} символов и превышает максимальный разрешённый размер в ${this._questionModelValidatorService.maxSourceLength} символов`
      );
      return;
    }

    if (
      questionCommentNoteBody.length >
      this._questionModelValidatorService.maxCommentLength
    ) {
      this._onFailure(
        this._parentComponentObject,
        `Размер блока текста с комментарием к заданию с номером ${questionNumber} составляет ${questionCommentNoteBody.length} символов и превышает максимальный разрешённый размер в ${this._questionModelValidatorService.maxCommentLength} символов`
      );
      return;
    }

    // формируем вопрос
    var question: QuestionDataModel = QuestionDataModel.createQuestion();
    // TODO XXX
    //  question.number = questionNumber;
    //  question.graded = questionNumber <= this.amountOfGradedQuestions;
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
      this._onFailure(
        this._parentComponentObject,
        `Первым символом строки ожидался символ #. Строка: ${sourceStringLine}`
      );
      return;
    }

    var colonSymbolPosition: number = sourceStringLine.indexOf(":");

    if (colonSymbolPosition == -1) {
      this._onFailure(
        this._parentComponentObject,
        `В начале строки должен быть символ двоеточия. Строка: ${sourceStringLine}`
      );
      return;
    }

    var numberString: string = sourceStringLine.substring(
      1,
      colonSymbolPosition
    );

    if (QuestionsImporter.isZeroOrPositiveInteger(numberString)) {
      return Number(numberString);
    } else {
      this._onFailure(
        this._parentComponentObject,
        `Номер задания может быть нулём либо целым положительным числом, а вы передали: ${numberString} в строке: ${sourceStringLine}`
      );
      return;
    }
  }
}
