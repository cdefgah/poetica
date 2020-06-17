import { AbstractModelValidationService } from "../base/AbstractModelValidationService";
import { HttpClient } from "@angular/common/http";

/**
 * Валидатор для проверки соответствия данных, которые ввели на клиенте, данным, которые представлены на сервере, в базе данных.
 */
export class RemoteDataValidationService extends AbstractModelValidationService {
  private _httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    super();
    this._httpClient = httpClient;
  }
}
