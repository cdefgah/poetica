/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
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
  public static readonly emptyTeam: TeamDataModel = new TeamDataModel();

  /**
   * Идентификатор записи в базе данных.
   */
  id: number = null;

  /**
   * Уникальный номер команды.
   */
  number: number = null;

  /**
   * Уникальное название команды.
   */
  title = '';

  public static createTeamByNumberAndTitle(teamNumber: number, teamTitle: string): TeamDataModel {
    const team = new TeamDataModel();
    team.number = teamNumber;
    team.title = teamTitle;
    return team;
  }

  public static createTeamFromMap(mapWithValues: Map<string, any>): TeamDataModel {
    const team = new TeamDataModel();
    team.setValuesFromMap(mapWithValues);
    return team;
  }

  public setValuesFromMap(initialMap: Map<string, any>) {
    this.id = initialMap['id'];
    this.number = initialMap['number'];
    this.title = initialMap['title'];
  }

  /**
   * Конструктор класса.
   */
  public constructor() {

  }

  public getObjectCopy(): TeamDataModel {
    const objectCopy = new TeamDataModel();
    objectCopy.id = this.id;
    objectCopy.number = this.number;
    objectCopy.title = this.title;

    return objectCopy;
  }

  public toString(): string {
    return `id: ${this.id}
number: ${this.number}
title: ${this.title}`;
  }
}
