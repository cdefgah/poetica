import { Question } from "src/app/model/Question";
import { AbstractDataImporter } from "src/app/utils/AbstractDataImporter";

export class QuestionsImporter extends AbstractDataImporter {
  sourceTextLines: string[];
  amountOfCreditedQuestions: number;

  index: number;

  expectedQuestionNumber: number;

  constructor(sourceText: string) {
    super();

    if (sourceText == null || sourceText.length == 0) {
      throw new Error("Поле для текста с заданиями пусто");
    }

    this.sourceTextLines = sourceText.trim().split("\n");

    this.index = 0;
    this.amountOfCreditedQuestions = 0;
    this.expectedQuestionNumber = 1;

    this.scanForAmountOfCreditedQuestions();

    for (let i = this.index; i < this.sourceTextLines.length; i++) {
      var questionNumberString: string = this.extractNumberFromTheLine(
        this.sourceTextLines[i]
      );
      if (questionNumberString.length > 0) {
        console.log("**************** EXTRACTED NUMBER ****************");
        console.log(questionNumberString);
        console.log("**************** **************** ****************");
      }
    }
  }

  private scanForAmountOfCreditedQuestions() {
    const prefix: string = "#G:";

    for (let i = 0; i < this.sourceTextLines.length; i++) {
      var processingLine: string = this.sourceTextLines[i].trim();
      var amountFoundAtIndex: number = -1;
      if (processingLine.length > 0) {
        if (processingLine.startsWith(prefix)) {
          var amountString: string = processingLine.substring(prefix.length);
          var amount: number = -1;

          if (this.isPositiveInteger(amountString)) {
            amount = Number(amountString);
          } else {
            throw new Error(
              "Количество зачётных заданий должно быть целым положительным числом, а вы передаёте: " +
                amountString
            );
          }
          amountFoundAtIndex = i;
          break;
        } else {
          throw new Error(
            "Первая не-пустая строка должна содержать информацию о количестве зачётных заданий и начинаться с " +
              prefix
          );
        }
      }
    }

    if (amountFoundAtIndex == -1) {
      throw new Error(
        "Не найдена строка с информацией о количестве зачётных заданий"
      );
    } else {
      this.amountOfCreditedQuestions = amount;
      this.index = amountFoundAtIndex + 1;
    }
  }

  next(): Question {
    var question: Question = new Question();
    var index = 1;

    question.number = index;
    question.body = "Some body for: " + index;
    question.source = "Some source for " + index;
    question.comment = "Some commend for " + index;

    return question;
  }

  /**
   * Извлекает номер задания из строки и возвращает строку с ним, если он там представлен.
   * Иначе возвращает пустую строку.
   * @param line строка для обработки.
   * @returns строка с номером задания, если он представлен. Иначе - пустая строка.
   */
  protected extractNumberFromTheLine(line: string): string {
    if (!line || line == null || line.length == 0) {
      return "";
    }

    var processingString: string = line.trim();
    const dot: string = ".";
    var dotPosition: number = processingString.indexOf(dot);
    if (dotPosition != -1) {
      var prefixString: string = processingString.substring(0, dotPosition);
      if (this.isPositiveInteger(prefixString)) {
        return prefixString;
      }
    }

    return "";
  }
}
