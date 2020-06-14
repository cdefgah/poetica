import { HttpClient } from "@angular/common/http";

/**
 * Абстрактный класс для разных валидаций моделей данных.
 */
export abstract class AbstractModelValidationService {
  protected httpClient: HttpClient;

  // используется в случае поломок, для хранения описания, что сломалось
  protected _brokenStateDescription: string = "";

  constructor(http: HttpClient) {
    this.httpClient = http;
  }

  protected setBrokenInternalState(description: string) {
    this._brokenStateDescription = description;
  }

  public isInternalStateCorrect() {
    return !(
      this._brokenStateDescription && this._brokenStateDescription.length > 0
    );
  }

  get brokenStateDescription(): string {
    return this._brokenStateDescription;
  }
}
