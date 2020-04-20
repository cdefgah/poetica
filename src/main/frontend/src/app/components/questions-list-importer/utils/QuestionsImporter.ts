import { Question } from "src/app/model/Question";
import { AbstractDataImporter } from "src/app/utils/AbstractDataImporter";

export class QuestionsImporter extends AbstractDataImporter {
  private static readonly sourcePrefix: string = "#S:";
  private static readonly commentNotePrefix: string = "#N:";
  private static readonly newLineReplacement: string = " // ";

  amountOfGradedQuestions: number;

  expectedQuestionNumber: number;

  questions: Question[];

  constructor(sourceText: string) {
    super(sourceText);
    this.expectedQuestionNumber = 1;
  }

  public doImport() {
    this.amountOfGradedQuestions = this.loadGradedQuestionsQty();

    this.questions = [];
    do {
      var question = this.nextQuestion();

      if (question != null) {
        console.log(
          "======================= QUESTION START ====================="
        );
        console.log(question.toString());
        console.log(
          "======================= QUESTION END ====================="
        );
        this.questions.push(question);
      }
    } while (question != null);
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
              ? "А вы передаёте: " + amountString
              : "Но вы не передали никакого значения.";

          throw new Error(
            "Количество зачётных заданий должно быть целым положительным числом. " +
              additionalMessage
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
    // первая строка должна быть с номером вопроса
    // функция должна быть isQuestionStartLine():bool
    // собираем текст до строки, которая начинается с #
    // второй символ должен быть S - если да, то загружаем source
    // до тех пор, пока не встретим строку, которая начинается с # (или до конца всех строк)
    // если второй символ не N - завершаем формирование вопроса и отдаём его
    // если N - загружаем комментарий пока не встретим строку начинающуюся с # (или до конца всех строк)

    if (!this.sourceTextLinesIterator.hasNextLine()) {
      return null;
    }

    var firstQuestionLine: string = this.sourceTextLinesIterator.nextLine();
    var questionNumber: number = this.extractQuestionNumber(firstQuestionLine);

    if (questionNumber != this.expectedQuestionNumber) {
      throw new Error(
        `Ожидался номер задания: ${this.expectedQuestionNumber}, но передан: ${questionNumber} в строке ${firstQuestionLine}`
      );
    }

    this.expectedQuestionNumber = this.expectedQuestionNumber + 1;
    var numberPrefix: string = "#" + questionNumber + ":";
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
        questionBody + QuestionsImporter.newLineReplacement + processingLine;
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
        QuestionsImporter.newLineReplacement +
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
            QuestionsImporter.newLineReplacement +
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
        "Первым символом строки ожидался символ #. Строка: " + sourceStringLine
      );
    }

    var colonSymbolPosition: number = sourceStringLine.indexOf(":");

    if (colonSymbolPosition == -1) {
      throw new Error(
        "В начале строки должен быть символ двоеточия. Строка: " +
          sourceStringLine
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
        "Номер задания должен быть целым положительным числом, а вы передали: " +
          numberString +
          " в строке: " +
          sourceStringLine
      );
    }
  }
}
