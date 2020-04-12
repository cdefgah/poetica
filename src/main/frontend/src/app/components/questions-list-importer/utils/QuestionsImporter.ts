import { Question } from "src/app/model/Question";
import { AbstractDataImporter } from "src/app/utils/AbstractDataImporter";

export class QuestionsImporter extends AbstractDataImporter {
  amountOfGradedQuestions: number;

  expectedQuestionNumber: number;

  questions: Question[];

  constructor(sourceText: string) {
    super(sourceText);
  }

  public doImport() {
    this.amountOfGradedQuestions = this.loadGradedQuestionsQty();
    this.questions = this.loadAllQuestions();
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

  private loadAllQuestions(): Question[] {}

  /**
   * Загружает вопрос из текстового блока.
   * @param firstQuestionBlockLine первая строка из блока заданий.
   * Когда мы загружаем второе и последующее задание, то чтобы понять,
   * что блок с одним заданием закончен, мы должны считать строку начала следующего задания.
   * И если мы её считали, то передаём в качестве параметра в метод считывания задания.
   * @returns объект
   */
  private loadOneQuestion(firstQuestionBlockLine: string): Question {
    var processingLine: string = firstQuestionBlockLine;

    if (processingLine == null || processingLine.length == 0) {
      // не надо проверять на наличие следующей строки, если бы строки кончились,
      // этот метод не был бы вызван
      processingLine = this.sourceTextLinesIterator.nextLine();
    }
  }
}
