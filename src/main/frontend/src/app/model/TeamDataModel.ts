/**
 * Модель данных команды.
 */
export class TeamDataModel {
  /**
   * Используется в случаях, когда нет информации о команде,
   * чтобы не создавать новых экземпляров класса.
   */
  public static readonly emptyTeam: TeamDataModel = new TeamDataModel();

  /**
   * Идентификатор записи в базе данных.
   */
  private _id: number;

  /**
   * Уникальный номер команды.
   */
  private _number: string = "";

  /**
   * Название команды.
   */
  private _title: string = "";

  public static createTeamByNumberAndTitle(
    number: string,
    title: string
  ): TeamDataModel {
    return new TeamDataModel(number, title);
  }

  public static createTeamByMapOfValues(
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
  private constructor(number?: string, title?: string) {
    this._number = number ? number : "";
    this._title = title ? title : "";
  }

  private setValuesFromMap(initialMap: Map<string, any>) {
    this._id = initialMap["id"];
    this._number = initialMap["number"];
    this._title = initialMap["title"];
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get number() {
    return this._number;
  }

  set number(value: string) {
    this._number = value;
  }

  get title() {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
  }

  public toString(): string {
    return `id: ${this._id}
number: ${this._number}
title: ${this._title}`;
  }
}
