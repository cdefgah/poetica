import { AbstractModelValidationService } from "../base/AbstractModelValidationService";
import { HttpClient } from "@angular/common/http";

export class EmailValidationService extends AbstractModelValidationService {
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

  /**
   * Проверяет корректность emailSubject и если всё в порядке, возвращает пустую строку. Иначе - сообщение об ошибке.
   * @param emailSubject тема письма для проверки.
   */
  public validateEmailSubject(emailSubject: string): string {
    if (emailSubject.length > this._maxSubjectLength) {
      return `Количество символов в теме письма (${emailSubject.length}) больше, чем максимально разрешённое для обработки: ${this._maxSubjectLength}`;
    } else {
      return "";
    }
  }

  /**
   * Проверяет корректность emailBody и если всё в порядке, возвращает пустую строку. Иначе - сообщение об ошибке.
   * @param emailBody содержание письма для проверки.
   */
  public validateEmailBody(emailBody: string): string {
    if (emailBody.length > this._maxBodyLength) {
      return `Количество символов в содержании письма (${emailBody.length}) больше, чем максимально разрешённое для обработки: ${this._maxBodyLength}`;
    } else {
      return "";
    }
  }
}
