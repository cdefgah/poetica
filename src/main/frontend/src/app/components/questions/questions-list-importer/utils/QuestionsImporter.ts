import { Question } from "src/app/model/Question";
import { AbstractMultiLineDataImporter } from "src/app/utils/AbstractMultilineDataImporter";

export class QuestionsImporter extends AbstractMultiLineDataImporter {
  private static readonly sourcePrefix: string = "#S:";
  private static readonly commentNotePrefix: string = "#N:";

  amountOfGradedQuestions: number;

  expectedQuestionNumber: number;

  questions: Question[];

  private readonly maxBodyLength: number;
  private readonly maxCommentLength: number;
  private readonly maxSourceLength: number;

  constructor(sourceText: string, modelConstraints: Map<string, number>) {
    super(sourceText);
    this.expectedQuestionNumber = 1;

    this.maxBodyLength = modelConstraints["MAX_BODY_LENGTH"];
    this.maxCommentLength = modelConstraints["MAX_COMMENT_LENGTH"];
    this.maxSourceLength = modelConstraints["MAX_SOURCE_LENGTH"];
  }

  public doImport() {
    this.amountOfGradedQuestions = this.loadGradedQuestionsQty();

    this.questions = [];
    var question: Question;
    while ((question = this.nextQuestion()) != null) {
      this.questions.push(question);
    }
  }

  private loadGradedQuestionsQty(): number {
    const prefix = "#G:";

    if (this.sourceTextLinesIterator.hasNextLine()) {
      var gradedQuestionsLine: string = this.sourceTextLinesIterator.nextLine();
      if (gradedQuestionsLine.startsWith(prefix)) {
        var amountString: string = gradedQuestionsLine
          .substring(prefix.length)
          .trim();
        if (QuestionsImporter.isPositiveInteger(amountString)) {
          return Number(amountString);
        } else {
          var additionalMessage: string =
            amountString.length > 0
              ? `А вы передаёте: "${amountString}"`
              : "Но вы не передали никакого значения.";

          throw new Error(
            `Количество зачётных заданий должно быть целым положительным числом. ${additionalMessage}`
          );
        }
      } else {
        throw new Error(
          "Первая не пустая строка текста должна содержать информацию о количестве зачётных заданий."
        );
      }
    } else {
      throw new Error("Не найдена информация о количестве зачётных заданий.");
    }
  }

  private nextQuestion(): Question {
    if (!this.sourceTextLinesIterator.hasNextLine()) {
      return null;
    }

    var firstQuestionLine: string = this.sourceTextLinesIterator.nextLine();
    var questionNumber: number = this.extractQuestionNumber(firstQuestionLine);

    if (questionNumber != this.expectedQuestionNumber) {
      throw new Error(
        `Ожидался номер задания: ${this.expectedQuestionNumber}, но передан: ${questionNumber} в строке "${firstQuestionLine}"`
      );
    }

    this.expectedQuestionNumber = this.expectedQuestionNumber + 1;
    var numberPrefix: string = `#${questionNumber}:`;
    var numberPrefixLength: number = numberPrefix.length;
    var questionBody: string = firstQuestionLine.substring(numberPrefixLength);
    var processingLine: string;
    var nextSegmentDetected: boolean = false;

    // загружаем непосредственный текст задания
    while (this.sourceTextLinesIterator.hasNextLine()) {
      processingLine = this.sourceTextLinesIterator.nextLine();
      if (QuestionsImporter.hasControlPrefix(processingLine)) {
        nextSegmentDetected = true;
        break;
      }

      questionBody =
        questionBody + QuestionsImporter.newLineSurrogate + processingLine;
    }

    var rtfmMessage: string =
      "Ознакомьтесь, пожалуйста, с требованиями к формату текста.";

    if (!nextSegmentDetected) {
      throw new Error(
        `После блока с текстом задания номер ${questionNumber} ожидался блок с информацией об источнике для этого задания. Но текст внезапно кончился.${rtfmMessage}`
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
    while (this.sourceTextLinesIterator.hasNextLine()) {
      processingLine = this.sourceTextLinesIterator.nextLine();

      if (QuestionsImporter.hasControlPrefix(processingLine)) {
        nextSegmentDetected = true;
        break;
      }

      questionSourceBody =
        questionSourceBody +
        QuestionsImporter.newLineSurrogate +
        processingLine;
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
        while (this.sourceTextLinesIterator.hasNextLine()) {
          processingLine = this.sourceTextLinesIterator.nextLine();

          if (QuestionsImporter.hasControlPrefix(processingLine)) {
            textBlockContinuesFurther = true;
            break;
          }

          questionCommentNoteBody =
            questionCommentNoteBody +
            QuestionsImporter.newLineSurrogate +
            processingLine;
        }

        // отматываем номер строки на одну строку назад,
        // так как мы зацепили следующий вопрос
        if (textBlockContinuesFurther) {
          this.sourceTextLinesIterator.stepIndexBack();
        }
      } else {
        // следующий вопрос

        // отматываем номер строки на одну строку назад,
        // так как мы зацепили следующий вопрос
        this.sourceTextLinesIterator.stepIndexBack();
      }
    }

    // проверяем ограничения на длину полей
    if (questionBody.length > this.maxBodyLength) {
      throw new Error(
        `Размер блока текста с содержанием задания ${questionNumber} составляет ${questionBody.length} символов и превышает максимальный разрешённый размер в ${this.maxBodyLength} символов`
      );
    }

    if (questionSourceBody.length > this.maxSourceLength) {
      throw new Error(
        `Размер блока текста с информацией об источнике задания ${questionNumber} составляет ${questionSourceBody.length} символов и превышает максимальный разрешённый размер в ${this.maxSourceLength} символов`
      );
    }

    if (questionCommentNoteBody.length > this.maxCommentLength) {
      throw new Error(
        `Размер блока текста с комментарием к заданию с номером ${questionNumber} составляет ${questionCommentNoteBody.length} символов и превышает максимальный разрешённый размер в ${this.maxCommentLength} символов`
      );
    }

    // формируем вопрос
    var question: Question = new Question();
    question.number = questionNumber;
    question.graded = questionNumber <= this.amountOfGradedQuestions;
    question.body = questionBody;
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

    if (QuestionsImporter.isPositiveInteger(numberString)) {
      return Number(numberString);
    } else {
      throw new Error(
        `Номер задания должен быть целым положительным числом, а вы передали: ${numberString} в строке: ${sourceStringLine}`
      );
    }
  }
}
