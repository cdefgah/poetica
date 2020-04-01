import { Question } from "src/app/model/Question";
import { AbstractDataImporter } from "src/app/utils/AbstractDataImporter";

export class QuestionsImporter extends AbstractDataImporter {
  private newLine: string = "\n";

  sourceTextLines: string[];
  amountOfCreditedQuestions: number;

  index: number;

  expectedQuestionNumber: number;

  questions: Question[] = [];

  constructor(sourceText: string) {
    super();

    if (sourceText == null || sourceText.length == 0) {
      throw new Error("Поле для текста с заданиями пусто");
    }

    console.log("**** Generating text lines");

    this.sourceTextLines = sourceText.trim().split(this.newLine);

    this.index = 0;
    this.amountOfCreditedQuestions = 0;
    this.expectedQuestionNumber = 1;

    console.log("**** Scanning for amount of credited questions");
    this.scanForAmountOfCreditedQuestions();
    console.log(
      "**** Amount of credited questions = " + this.amountOfCreditedQuestions
    );

    console.log("**** Scanning for questions");
    this.scanForQuestions();

    console.log("**** End of scanning");
  }

  private scanForQuestions() {
    var questionNumber: number = 0;
    console.log(">>> SCAN FOR QUESTIONS START");
    while (this.index < this.sourceTextLines.length) {
      console.log("..... loop start. this.index = " + this.index);
      console.log("... skipping empty lines");
      while (this.sourceTextLines[this.index].trim().length == 0) {
        this.index++;
      }
      console.log(".... text block started. this.index = " + this.index);

      var processingLine: string = this.sourceTextLines[this.index].trim();

      var questionNumberString: string = this.extractNumberFromTheLine(
        processingLine
      );

      console.log("processing line: " + this.sourceTextLines[this.index]);
      console.log(
        "..... extracted question number from the line: " + questionNumberString
      );

      if (questionNumberString.length > 0) {
        questionNumber = Number(questionNumberString);
        console.log("..... converted question number: " + questionNumber);

        console.log(".... loading question start ");
        var question: Question = this.loadQuestion(questionNumber);
        console.log(".... loading question end ");
        console.dir(question);

        this.questions.push(question);
      }
    }

    if (questionNumber < this.amountOfCreditedQuestions) {
      throw new Error(
        "Общее количество загруженных заданий (" +
          questionNumber +
          ") меньше, чем указанное количество зачётных заданий (" +
          this.amountOfCreditedQuestions +
          ")."
      );
    }

    console.log(">>> SCAN FOR QUESTIONS END");
  }

  private loadQuestion(questionNumber: number): Question {
    if (questionNumber != this.expectedQuestionNumber) {
      throw new Error(
        "Ожидался номер задания: " +
          this.expectedQuestionNumber +
          ", но в тексте вместо него идёт номер: " +
          questionNumber
      );
    }

    var questionBody: string;
    this.expectedQuestionNumber++;
    var processingString: string = this.sourceTextLines[this.index].trim();
    questionBody = processingString.substring(processingString.indexOf("."));

    console.log(" ======== QUESTION BODY START =============");

    // загружаем тело задания
    while (processingString.length > 0) {
      this.index++;
      processingString = this.sourceTextLines[this.index].trim();
      questionBody = processingString;

      if (processingString.length > 0) {
        if (this.extractNumberFromTheLine(processingString).length > 0) {
          // внезапно начался следующий вопрос (следующее задание)
          // а где источник для текущего вопроса (задания)?
          // мы же его не загрузили?!
          // бросаем исключение по этому поводу.
          throw new Error(
            "Начался блок следующего задания, хотя мы ожидали источник для задания номер: " +
              questionNumber
          );
        }

        questionBody = questionBody + this.newLine + processingString;
      }
    }

    // попалась пустая строка
    // тело задания загрузили, создаём объект
    var question: Question = new Question();
    question.number = questionNumber;
    question.credited = questionNumber <= this.amountOfCreditedQuestions;
    question.body = questionBody;
    var nextQuestionBlockStarted: boolean = false;

    console.log(" ======== QUESTION BODY END=============");

    // сканируем в поиска источника задания
    var questionSource: string = "";
    var questionSourceStarted: boolean = false;
    while (true) {
      this.index++;
      if (this.index < this.sourceTextLines.length) {
        processingString = this.sourceTextLines[this.index].trim();
        if (processingString.length > 0) {
          if (this.extractNumberFromTheLine(processingString).length > 0) {
            if (!questionSourceStarted) {
              // внезапно начался следующий вопрос (следующее задание)
              // хотя источник для текущего задания ещё не загружен.
              // бросаем исключение по этому поводу.
              throw new Error(
                "Начался блок следующего задания, хотя мы ожидали источник для задания номер: " +
                  questionNumber
              );
            } else {
              // начался блок следующего задания
              nextQuestionBlockStarted = true;
              break;
            }
          }

          if (questionSource.length == 0) {
            // ставим флаг, что загрузка источника началась
            questionSourceStarted = true;
            questionSource = processingString;
          } else {
            questionSource = questionSource + this.newLine + processingString;
          }
        } else {
          // если пустая строка попалась после того, как мы начали загружать источник задания
          // то источник задания загружен
          if (questionSourceStarted) {
            break;
          }
        }
      } else {
        throw new Error(
          "Импортируемый текст закончился до того, как удалось найти источник для задания номер: " +
            questionNumber
        );
      }
    }

    question.source = questionSource;

    if (!nextQuestionBlockStarted) {
      // сканируем в поиска комментария к заданию
      // если предыдущий блок закончился не началом блока нового задания
      var questionComment: string = "";
      var questionCommentStarted: boolean = false;
      while (true) {
        this.index++;
        if (this.index < this.sourceTextLines.length) {
          processingString = this.sourceTextLines[this.index].trim();
          if (processingString.length > 0) {
            // проверяем, начался-ли следующий вопрос
            if (this.extractNumberFromTheLine(processingString).length > 0) {
              // начался следующий вопрос, выходим
              break;
            }

            if (questionComment.length == 0) {
              questionCommentStarted = true;
              questionComment = processingString;
            } else {
              questionComment =
                questionComment + this.newLine + processingString;
            }
          } else {
            // если пустая строка, и комментарий начал загружаться, завершаем загрузку комментария
            if (questionCommentStarted) {
              break;
            }
          }
        } else {
          // текст закончился, а комментария нет
          break;
        }
      }

      question.comment = questionComment;
    }

    return question;
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
