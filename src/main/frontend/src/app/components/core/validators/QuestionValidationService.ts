/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { AbstractModelValidationService } from '../base/AbstractModelValidationService';
import { HttpClient } from '@angular/common/http';

export class QuestionValidationService extends AbstractModelValidationService {
  private _maxTitleLength: number;
  private _maxBodyLength: number;
  private _maxAuthorsAnswerLength: number;
  private _maxCommentlength: number;
  private _maxSourceLength: number;
  private _maxAuthorInfoLength: number;

  constructor(httpClient: HttpClient) {
    super();

    const url = '/questions/model-constraints';
    httpClient.get(url).subscribe(
      (data: Map<string, string>) => {
        this._maxTitleLength = parseInt(data['MAX_TITLE_LENGTH'], 10);
        this._maxBodyLength = parseInt(data['MAX_BODY_LENGTH'], 10);
        this._maxAuthorsAnswerLength = parseInt(data['MAX_AUTHORS_ANSWER_LENGTH'], 10);
        this._maxCommentlength = parseInt(data['MAX_COMMENT_LENGTH'], 10);
        this._maxSourceLength = parseInt(data['MAX_SOURCE_LENGTH'], 10);
        this._maxAuthorInfoLength = parseInt(data['MAX_AUTHOR_INFO_LENGTH'], 10);
      },
      (error) => {
        const errorMessage = `$Ошибка при получении model-constraints для Question. ${error.error}. Код статуса: ${error.status}. Сообщение сервера: '${error.message}'`;
        this.setBrokenInternalState(errorMessage);
      }
    );
  }

  get maxTitleLength(): number {
    return this._maxTitleLength;
  }

  get maxBodyLength(): number {
    return this._maxBodyLength;
  }

  get maxAuthorsAnswerLength(): number {
    return this._maxAuthorsAnswerLength;
  }

  get maxCommentLength(): number {
    return this._maxCommentlength;
  }

  get maxSourceLength(): number {
    return this._maxSourceLength;
  }

  get maxAuthorInfoLength(): number {
    return this._maxAuthorInfoLength;
  }
}
