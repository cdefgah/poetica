/**
 * Хранит результат вычисления чего-нибудь.
 * Также, если произошла ошибка, хранит информацию об этом.
 */
export class CalculationResult {
  private _resultObject: any;
  private _errorMessage: string;

  constructor(resultObject: any, errorMessage: string) {
    this._resultObject = resultObject;
    this._errorMessage = errorMessage;
  }

  public get errorsPresent(): boolean {
    return this._errorMessage && this._errorMessage.length > 0;
  }

  get errorMessage() {
    return this._errorMessage;
  }

  get result(): any {
    return this._resultObject;
  }
}
