import { AbstractModelValidationService } from "../base/AbstractModelValidationService";
import { HttpClient } from "@angular/common/http";

export class QuestionShallowValidationService extends AbstractModelValidationService {
  private _maxBodyLength: number;
  private _maxSourceLength: number;
  private _maxCommentlength: number;

  constructor(httpClient: HttpClient) {
    super();

    const url: string = "/questions/model-constraints";
    httpClient.get(url).subscribe(
      (data: Map<string, string>) => {
        this._maxBodyLength = parseInt(data["MAX_BODY_LENGTH"]);
        this._maxSourceLength = parseInt(data["MAX_SOURCE_LENGTH"]);
        this._maxCommentlength = parseInt(data["MAX_COMMENT_LENGTH"]);
      },
      (error) => {
        var errorMessage: string = `$Ошибка при получении model-constraints для Question. ${error.error}. Код статуса: ${error.status}. Сообщение сервера: '${error.message}'`;
        this.setBrokenInternalState(errorMessage);
      }
    );
  }

  get maxBodyLength(): number {
    return this._maxBodyLength;
  }

  get maxSourceLength(): number {
    return this._maxSourceLength;
  }

  get maxCommentLength(): number {
    return this._maxCommentlength;
  }
}
