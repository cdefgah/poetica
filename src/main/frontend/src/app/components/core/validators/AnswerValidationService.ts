/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { AbstractModelValidationService } from "../base/AbstractModelValidationService";
import { HttpClient } from "@angular/common/http";

export class AnswerValidationService extends AbstractModelValidationService {
  private _maxBodyLength: number;
  private _maxCommentLength: number;

  constructor(httpClient: HttpClient) {
    super();

    const url: string = "/answers/model-constraints";
    httpClient.get(url).subscribe(
      (data: Map<string, string>) => {
        this._maxBodyLength = parseInt(data["MAX_BODY_LENGTH"]);
        this._maxCommentLength = parseInt(data["MAX_COMMENT_LENGTH"]);
      },
      (error) => {
        var errorMessage: string = `$Ошибка при получении model-constraints для Answer. ${error.error}. Код статуса: ${error.status}. Сообщение сервера: '${error.message}'`;
        this.setBrokenInternalState(errorMessage);
      }
    );
  }

  /**
   * Проверяет корректность answerBody и возвращает пустую строку, если всё в порядке. Иначе возвращает сообщение об ошибке.
   * @param answerBody тело ответа для проверки.
   */
  public validateAnswerBody(
    answerBody: string,
    questionNumber: string
  ): string {
    if (answerBody.length > this._maxBodyLength) {
      return `Количество символов в ответе с номером ${questionNumber} равно ${answerBody.length} и превышает максимально допустимое количество символов для обработки: ${this._maxBodyLength}`;
    } else {
      return "";
    }
  }

  public validateAnswerComment(
    answerComment: string,
    questionNumber: string
  ): string {
    if (answerComment.length > this._maxCommentLength) {
      return `Количество символов в комментарии к ответу c номером ${questionNumber} равно ${answerComment.length} и превышает максимально допустимое количество символов для обработки: ${this._maxCommentLength}`;
    } else {
      return "";
    }
  }
}
