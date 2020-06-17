import { AbstractModelValidationService } from "../base/AbstractModelValidationService";
import { HttpClient } from "@angular/common/http";

export class EmailShallowValidationService extends AbstractModelValidationService {
  private _maxSubjectLength: number;
  private _maxBodyLength: number;

  constructor(httpClient: HttpClient) {
    super();

    const url: string = "/emails/model-constraints";
    httpClient.get(url).subscribe(
      (data: Map<string, string>) => {
        this._maxSubjectLength = parseInt(data["MAX_SUBJECT_LENGTH"]);
        this._maxBodyLength = parseInt(data["MAX_BODY_LENGTH"]);
      },
      (error) => {
        var errorMessage: string = `$Ошибка при получении model-constraints для Email. ${error.error}. Код статуса: ${error.status}. Сообщение сервера: '${error.message}'`;
        this.setBrokenInternalState(errorMessage);
      }
    );
  }

  get maxBodyLength(): number {
    return this._maxBodyLength;
  }

  get maxSubjectLength(): number {
    return this._maxSubjectLength;
  }
}
