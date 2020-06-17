import { AbstractModelValidationService } from "../base/AbstractModelValidationService";
import { HttpClient } from "@angular/common/http";

export class AnswerShallowValidatorService extends AbstractModelValidationService {
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

  get maxBodyLength(): number {
    return this._maxBodyLength;
  }

  get maxCommentLength(): number {
    return this._maxCommentLength;
  }
}
