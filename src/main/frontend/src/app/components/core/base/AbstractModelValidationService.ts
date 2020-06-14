import { HttpClient } from "@angular/common/http";

/**
 * Абстрактный класс для разных валидаций моделей данных.
 */
export abstract class AbstractModelValidationService {
  protected httpClient: HttpClient;

  // используется в случае поломок, для хранения описания, что сломалось
  protected brokenStateDescription: string = "";

  constructor(http: HttpClient) {
    this.httpClient = http;
  }

  protected setBrokenInternalState(description: string) {
    this.brokenStateDescription = description;
  }

  protected isInternalStateCorrect() {
    return !(
      this.brokenStateDescription && this.brokenStateDescription.length > 0
    );
  }
}
