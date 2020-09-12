/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

/**
 * Модель данных команды.
 */
export class TeamDataModel {
  /**
   * NOTE: если применять геттеры и сеттеры для полей, то при отправке массива объектов этого класса
   * на сервер приходят пустые объекты без значений в полях.
   * Скорее всего это баг в Angular.
   * Так что в модели все поля публичные.
   */

  /**
   * Используется в случаях, когда нет информации о команде,
   * чтобы не создавать новых экземпляров класса.
   */
  public static readonly emptyTeam: TeamDataModel = TeamDataModel.createtTeam();

  /**
   * Идентификатор записи в базе данных.
   */
  id: number;

  /**
   * Уникальный номер команды.
   */
  number = -1;

  /**
   * Уникальное название команды.
   */
  title = '';

  public static createTeamByNumberAndTitle(
    teamNumber: number,
    teamTitle: string
  ): TeamDataModel {
    return new TeamDataModel(teamNumber, teamTitle);
  }

  public static createTeamFromMap(
    mapWithValues: Map<string, any>
  ): TeamDataModel {
    const team = TeamDataModel.createtTeam();
    team.setValuesFromMap(mapWithValues);
    return team;
  }

  public static createtTeam(): TeamDataModel {
    return new TeamDataModel(-1, '');
  }

  /**
   * Конструктор класса.
   * @param number уникальный номер команды.
   * @param title название команды.
   */
  private constructor(teamNumber: number, teamTitle?: string) {
    this.number = teamNumber;
    this.title = teamTitle ? teamTitle : '';
  }

  private setValuesFromMap(initialMap: Map<string, any>) {
    this.id = initialMap['id'];
    this.number = initialMap['number'];
    this.title = initialMap['title'];
  }

  public toString(): string {
    return `id: ${this.id}
number: ${this.number}
title: ${this.title}`;
  }
}
