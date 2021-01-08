/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

/**
 * Модель данных задания (вопроса).
 */
export class QuestionDataModel {
  /**
   * NOTE: если применять геттеры и сеттеры для полей, то при отправке массива объектов этого класса
   * на сервер приходят пустые объекты без значений в полях.
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
   * Если задание содержит несколько номеров, то наименьший.
   */
  lowestInternalNumber: number;

  /**
   * Если задание содержит несколько номеров, то наибольший.
   */
  highestInternalNumber: number;

  /**
   * Заголовок задания.
   */
  title: string;

  /**
   * Содержание задания.
   */
  body: string;


  /**
   * Авторский вариант ответа.
   */
  authorsAnswer: string;

  /**
   * Комментарий к заданию.
   */
  comment: string;

  /**
   * Источник задания.
   */
  source: string;

  /**
   * Информация об авторе задания.
   */
  authorInfo: string;

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
    const question = new QuestionDataModel();
    question.setValuesFromMap(mapWithValues);
    return question;
  }

  private constructor() {
    this.id = 0;
    this.externalNumber = '';
    this.lowestInternalNumber = -1;
    this.highestInternalNumber = -1;
    this.title = '';
    this.body = '';
    this.authorsAnswer = '';
    this.source = '';
    this.comment = '';
    this.authorInfo = '';
    this.graded = true;
  }

  private setValuesFromMap(initialMap: Map<string, any>) {
    this.id = initialMap['id'];
    this.externalNumber = initialMap['externalNumber'];
    this.lowestInternalNumber = initialMap['lowestInternalNumber'];
    this.highestInternalNumber = initialMap['highestInternalNumber'];
    this.title = initialMap['title'];
    this.body = initialMap['body'];
    this.authorsAnswer = initialMap['authorsAnswer'];
    this.source = initialMap['source'];
    this.comment = initialMap['comment'];
    this.graded = initialMap['graded'];
    this.authorInfo = initialMap['authorInfo'];
  }
}
