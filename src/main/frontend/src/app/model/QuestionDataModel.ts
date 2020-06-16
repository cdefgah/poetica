/**
 * Модель данных задания (вопроса).
 */
export class QuestionDataModel {
  /**
   * NOTE: если применять геттеры и сеттеры для полей, то при отправке массива объектов этого класса на сервер приходят пустые объекты без значений в полях.
   * Скорее всего это баг в Angular.
   * Так что в модели все поля публичные.
   */

  /**
   * Используется в случаях, когда нет информации о задании,
   * чтобы не создавать новых экземпляров класса.
   */
  public static readonly emptyQuestion: QuestionDataModel = new QuestionDataModel();

  /**
   * Идентификатор записи в базе данных.
   */
  id: number;

  /**
   * Уникальный номер задания.
   */
  number: number;

  /**
   * Содержание задания.
   */
  body: string;

  /**
   * Источник задания.
   */
  source: string;

  /**
   * Комментарий к заданию.
   */
  comment: string;

  /**
   * Отметка, является-ли задание зачётным (значение true).
   */
  graded: boolean;

  public static createQuestion(): QuestionDataModel {
    return new QuestionDataModel();
  }

  public static createTeamByMapOfValues(
    mapWithValues: Map<string, any>
  ): QuestionDataModel {
    var question = new QuestionDataModel();
    question.setValuesFromMap(mapWithValues);
    return question;
  }

  private constructor() {
    this.id = 0;
    this.number = 0;
    this.body = "";
    this.source = "";
    this.comment = "";
    this.graded = true;
  }

  private setValuesFromMap(initialMap: Map<string, any>) {
    this.id = initialMap["id"];
    this.number = initialMap["number"];
    this.body = initialMap["body"];
    this.comment = initialMap["comment"];
    this.source = initialMap["source"];
    this.graded = initialMap["graded"];
  }

  toString(): string {
    return `id:${this.id}\nnumber:${this.number}\ngraded:${this.graded}\nbody:${this.body}\nsource:${this.source}\ncomment:${this.comment}\n`;
  }
}
