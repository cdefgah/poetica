/**
 * Модель данных команды.
 */
export class TeamDataModel {
  /**
   * NOTE: если применять геттеры и сеттеры для полей, то при отправке массива объектов этого класса на сервер приходят пустые объекты без значений в полях.
   * Скорее всего это баг в Angular.
   * Так что в модели все поля публичные.
   */

  /**
   * Используется в случаях, когда нет информации о команде,
   * чтобы не создавать новых экземпляров класса.
   */
  public static readonly emptyTeam: TeamDataModel = new TeamDataModel();

  /**
   * Идентификатор записи в базе данных.
   */
  id: number;

  /**
   * Уникальный номер команды.
   */
  number: number = -1;

  /**
   * Уникальное название команды.
   */
  title: string = "";

  public static createTeamByNumberAndTitle(
    number: number,
    title: string
  ): TeamDataModel {
    return new TeamDataModel(number, title);
  }

  public static createTeamFromMap(
    mapWithValues: Map<string, any>
  ): TeamDataModel {
    var team = new TeamDataModel();
    team.setValuesFromMap(mapWithValues);
    return team;
  }

  public static createtTeam(): TeamDataModel {
    return new TeamDataModel();
  }

  /**
   * Конструктор класса.
   * @param number уникальный номер команды.
   * @param title название команды.
   */
  private constructor(number?: number, title?: string) {
    this.number = number ? number : -1;
    this.title = title ? title : "";
  }

  private setValuesFromMap(initialMap: Map<string, any>) {
    this.id = initialMap["id"];
    this.number = initialMap["number"];
    this.title = initialMap["title"];
  }

  public toString(): string {
    return `id: ${this.id}
number: ${this.number}
title: ${this.title}`;
  }
}
