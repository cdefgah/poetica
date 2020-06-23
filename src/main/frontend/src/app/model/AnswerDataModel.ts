/**
 * Модель данных ответа на вопрос (бескрылку).
 */
export class AnswerDataModel {
  /**
   * Используется в случаях, когда нет информации об ответе.
   * чтобы не создавать новых экземпляров класса.
   */
  public static readonly emptyAnswer: AnswerDataModel = new AnswerDataModel(
    "",
    "",
    ""
  );

  emailId: number;
  questionId: number;
  roundNumber: number;

  /**
   * Уникальный номер вопроса (бескрылки).
   */
  questionNumber: string = "";

  /**
   * Содержание ответа.
   */
  body: string = "";

  /**
   * Необязательный комментарий к ответу.
   */
  comment: string = "";

  /**
   * Конструктор класса.
   * @param questionNumber уникальный номер задания (бескрылки).
   * @param body содержимое ответа.
   * @param comment необязательный комментарий.
   */
  constructor(questionNumber: string, body: string, comment: string) {
    this.questionNumber = questionNumber;
    this.body = body;
    this.comment = comment;
  }

  public toString(): string {
    return `emailId: ${this.emailId}
questionId: ${this.questionNumber}
roundNumber: ${this.roundNumber}
questionNumber: ${this.questionNumber}
body: ${this.body}
comment: ${this.comment}`;
  }
}
