import { logging } from "protractor";
import { debugString } from "../utils/Config";

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

  public static readonly GradeNone: string = "None";

  /**
   * Уникальный идентификатор ответа в базе данных.
   */
  id: number;

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
   * Отметка об оценке
   */
  grade: string = AnswerDataModel.GradeNone;

  /**
   * Дата отправки письма с ответом.
   */
  emailSentOn: number;

  public static createAnswerFromMap(
    mapWithValues: Map<string, any>
  ): AnswerDataModel {
    var questionNumber: number = mapWithValues["questionNumber"];
    var body: string = mapWithValues["body"];
    var comment: string = mapWithValues["comment"];

    var answer = new AnswerDataModel(questionNumber, body, comment);
    answer.id = mapWithValues["id"];
    answer.emailId = mapWithValues["emailId"];
    answer.teamId = mapWithValues["teamId"];
    answer.roundNumber = mapWithValues["roundNumber"];
    answer.questionId = mapWithValues["questionId"];
    answer.grade = mapWithValues["grade"];
    answer.emailSentOn = mapWithValues["emailSentOn"];

    return answer;
  }

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
    comment: ${this.comment}
    grade: ${this.grade}
    emailSentOn: ${this.emailSentOn}`;
  }

  public get answerGrade2Display() {
    var result: string = "???";
    switch (this.grade) {
      case "None":
        result = "без оценки";
        break;

      case "Accepted":
        result = "принят";
        break;

      case "NotAccepted":
        result = "отклонён";
        break;
    }

    return result;
  }

  public get isCommentPresent(): boolean {
    return this.comment && this.comment.length > 0;
  }
}