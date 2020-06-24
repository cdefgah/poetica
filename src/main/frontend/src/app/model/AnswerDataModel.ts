/**
 * Модель данных ответа на вопрос (бескрылку).
 */
export class AnswerDataModel {
  /**
   * Используется в случаях, когда нет информации об ответе.
   * чтобы не создавать новых экземпляров класса.
   */
  public static readonly emptyAnswer: AnswerDataModel = new AnswerDataModel(
    undefined,
    "",
    ""
  );

  /**
   * Идентификатор почтового сообщения.
   */
  emailId: number;

  /**
   * Идентификатор команды в базе.
   */
  teamId: number;

  /**
   * Номер тура.
   */
  roundNumber: number;

  /**
   * Идентификатор вопроса в базе данных.
   */
  questionId: number;

  /**
   * Уникальный номер вопроса (бескрылки).
   */
  questionNumber: number;

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
  constructor(questionNumber: number, body: string, comment: string) {
    this.questionNumber = questionNumber;
    this.body = body;
    this.comment = comment;
  }

  public toString(): string {
    return `emailId: ${this.emailId}
    teamId: ${this.teamId}
    questionId: ${this.questionNumber}
    roundNumber: ${this.roundNumber}
    questionNumber: ${this.questionNumber}
    body: ${this.body}
    comment: ${this.comment}`;
  }
}
