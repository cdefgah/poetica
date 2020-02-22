/**
 * Модель данных ответа на вопрос (бескрылку).
 */
export class Answer {
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
   * @param questionNumber уникальный номер вопроса (бескрылки).
   * @param body содержимое ответа.
   * @param comment необязательный комментарий.
   */
  constructor(questionNumber: string, body: string, comment: string) {
    this.questionNumber = questionNumber;
    this.body = body;
    this.comment = comment;
  }
}
