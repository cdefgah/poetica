/**
 * Модель данных команды.
 */
export class Team {
  /**
   * Используется в случаях, когда нет информации о команде,
   * чтобы не создавать новых экземпляров класса.
   */
  public static readonly emptyTeam: Team = new Team();

  /**
   * Идентификатор записи в базе данных.
   */
  private id: number;

  /**
   * Уникальный номер команды.
   */
  private number: string = "";

  /**
   * Название команды.
   */
  private title: string = "";

  private static numberRegExValidator: RegExp;

  public static initializeRegexpValidator(
    modelConstraints: Map<string, string>
  ) {
    const regexpString: string = modelConstraints["NUMBER_VALIDATION_REGEXP"];
    Team.numberRegExValidator = new RegExp(regexpString);
  }

  public static createTeamByNumberAndTitle(
    number: string,
    title: string
  ): Team {
    return new Team(number, title);
  }

  public static createTeamByMapOfValues(mapWithValues: Map<string, any>): Team {
    var team = new Team();
    team.setValuesFromMap(mapWithValues);
    return team;
  }

  public static createtTeam(): Team {
    return new Team();
  }

  /**
   * Конструктор класса.
   * @param number уникальный номер команды.
   * @param title название команды.
   */
  private constructor(number?: string, title?: string) {
    this.number = number ? number : "";
    this.title = title ? title : "";
  }

  private setValuesFromMap(initialMap: Map<string, any>) {
    this.id = initialMap["id"];
    this.number = initialMap["number"];
    this.title = initialMap["title"];
  }

  public getId(): number {
    return this.id;
  }

  public getNumber(): string {
    return this.number;
  }

  public getTitle(): string {
    return this.title;
  }

  public toString(): string {
    return `id: ${this.id}
number: ${this.number}
title: ${this.title}`;
  }
}
