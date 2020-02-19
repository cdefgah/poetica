/**
 * Модель данных команды.
 */
export class Team {
  /**
   * Используется в случаях, когда нет информации о команде,
   * чтобы не создавать новых экземпляров класса.
   */
  public static emptyTeam: Team = new Team();

  /**
   * Идентификатор записи в базе данных.
   */
  id: number;

  /**
   * Уникальный номер команды.
   */
  number: string = "";

  /**
   * Название команды.
   */
  title: string = "";

  public static numberRegExValidator: RegExp;

  public static initializeRegexpValidator(
    modelConstraints: Map<string, string>
  ) {
    const regexpString: string = modelConstraints["NUMBER_VALIDATION_REGEXP"];
    Team.numberRegExValidator = new RegExp(regexpString);
  }

  /**
   * Конструктор класса.
   * @param number уникальный номер команды.
   * @param title название команды.
   */
  constructor(
    number?: string,
    title?: string,
    modelConstraints?: Map<string, string>
  ) {
    this.number = number ? number : "";
    this.title = title ? title : "";
  }

  initialize(initialMap: Map<string, any>) {
    this.id = initialMap["id"];
    this.number = initialMap["number"];
    this.title = initialMap["title"];
  }
}
