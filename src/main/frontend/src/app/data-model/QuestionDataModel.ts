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
   * Используется для инициализации в случаях, когда пока ещё нет информации о задании,
   * чтобы не создавать новых экземпляров класса и позволить отобразить компоненты,
   * которые завязаны на поля модели.
   */
  public static readonly emptyQuestion: QuestionDataModel = new QuestionDataModel();

  /**
   * Идентификатор записи в базе данных.
   */
  id: number;

  /**
   * Номер задания для отображения на экране.
   * Содержит либо один номер (0 либо целое положительное число),
   * либо цепочку номеров. Например 8-9 для двукрылок.
   */
  externalNumber: string;

  /**
   * Номера бескрылок, инкапсулированные в задании.
   * Для однокрылки - это будет один номер.
   * Номер, собственно, задания.
   * Для многокрылок (двух и более крылок) -
   * будут содержаться номера, которые указаны через дефис при импорте.
   * Например, если при импорте указаны номера 8-9 для двукрылки,
   * то в этом поле будет массив из двух элементов со значениями
   * 8 и 9.
   */
  internalNumbers: number[];

  /**
   * Заголовок задания.
   */
  title: string;

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

  public static createQuestionFromMap(
    mapWithValues: Map<string, any>
  ): QuestionDataModel {
    var question = new QuestionDataModel();
    question.setValuesFromMap(mapWithValues);
    return question;
  }

  private constructor() {
    this.id = 0;
    this.externalNumber = "";
    this.internalNumbers = [];
    this.title = "";
    this.body = "";
    this.source = "";
    this.comment = "";
    this.graded = true;
  }

  private setValuesFromMap(initialMap: Map<string, any>) {
    this.id = initialMap["id"];
    this.externalNumber = initialMap["externalNumber"];
    this.internalNumbers = initialMap["internalNumbers"];
    this.title = initialMap["title"];
    this.body = initialMap["body"];
    this.source = initialMap["source"];
    this.comment = initialMap["comment"];
    this.graded = initialMap["graded"];
  }
}
