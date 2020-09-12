/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
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
        this._maxTitleLength = parseInt(data['MAX_TITLE_LENGTH']);
        this._maxBodyLength = parseInt(data['MAX_BODY_LENGTH']);
        this._maxAuthorsAnswerLength = parseInt(
          data['MAX_AUTHORS_ANSWER_LENGTH']
        );
        this._maxCommentlength = parseInt(data['MAX_COMMENT_LENGTH']);
        this._maxSourceLength = parseInt(data['MAX_SOURCE_LENGTH']);
        this._maxAuthorInfoLength = parseInt(data['MAX_AUTHOR_INFO_LENGTH']);
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
