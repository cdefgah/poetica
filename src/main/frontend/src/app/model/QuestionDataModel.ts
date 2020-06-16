/**
 * Модель данных задания (вопроса).
 */
export class QuestionDataModel {
  /**
   * Используется в случаях, когда нет информации о задании,
   * чтобы не создавать новых экземпляров класса.
   */
  public static readonly emptyQuestion: QuestionDataModel = new QuestionDataModel();

  /**
   * Идентификатор записи в базе данных.
   */
  private _id: number;

  /**
   * Уникальный номер задания.
   */
  private _number: number;

  /**
   * Содержание задания.
   */
  private _body: string;

  /**
   * Источник задания.
   */
  private _source: string;

  /**
   * Комментарий к заданию.
   */
  private _comment: string;

  /**
   * Отметка, является-ли задание зачётным (значение true).
   */
  private _graded: boolean;

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
    this._id = 0;
    this._number = 0;
    this._body = "";
    this._source = "";
    this._comment = "";
    this._graded = true;
  }

  private setValuesFromMap(initialMap: Map<string, any>) {
    this._id = initialMap["id"];
    this._number = initialMap["number"];
    this._body = initialMap["body"];
    this._comment = initialMap["comment"];
    this._source = initialMap["source"];
    this._graded = initialMap["graded"];
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get number(): number {
    return this._number;
  }

  set number(value: number) {
    this._number = value;
  }

  get body(): string {
    return this._body;
  }

  set body(value: string) {
    this._body = value;
  }

  get source(): string {
    return this._source;
  }

  set source(value: string) {
    this._source = value;
  }

  get comment(): string {
    return this._comment;
  }

  set comment(value: string) {
    this._comment = value;
  }

  get graded(): boolean {
    return this._graded;
  }

  set graded(value: boolean) {
    this._graded = value;
  }

  toString(): string {
    return `id:${this._id}\nnumber:${this._number}\ngraded:${this._graded}\nbody:${this._body}\nsource:${this._source}\ncomment:${this._comment}\n`;
  }
}
