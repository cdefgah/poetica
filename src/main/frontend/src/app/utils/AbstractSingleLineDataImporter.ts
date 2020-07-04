export abstract class AbstractSingleLineDataImporter {
  protected _parentComponentObject: any;

  private _normalizedSourceString: string;

  protected _onSuccess: Function;
  protected _onFailure: Function;

  constructor(rawSourceText: string, onSuccess: Function, onFailure: Function) {
    this._normalizedSourceString = AbstractSingleLineDataImporter.normalizeString(
      rawSourceText
    );

    this._onSuccess = onSuccess;
    this._onFailure = onFailure;
  }

  protected get normalizedSourceString(): string {
    return this._normalizedSourceString;
  }

  /**
   * Заменяет символы кавычек и дефисов на унифицированный символ,
   * для стандартизации текста перед обработкой.
   * @param sourceString исходная строка для обработки.
   * @returns нормализованная строка.
   */
  protected static normalizeString(sourceString: string): string {
    if (!sourceString || sourceString.length == 0) {
      return "";
    }

    // убираем ненужные символы
    var processedString: string = sourceString.replace(/[¶]/g, "");

    // нормализуем кавычки
    processedString = processedString.replace(/[‘’“”„‹›'»«]/g, '"');

    // нормализуем тире и дефисы
    processedString = processedString.replace(/[-֊־᠆‐‒–—―⸺⸻〰﹘﹣－]/g, "-");

    return processedString;
  }

  private static isNumber(value: string | number): boolean {
    return value != null && value !== "" && !isNaN(Number(value.toString()));
  }

  protected static isZeroOrPositiveInteger(sourceString: string): boolean {
    // нормализация нужна, чтобы исключить случаи, когда перед нулём дали символ минуса или плюса
    // или дали два или более нулей в качестве исходной строки.
    var normalizedString: string = AbstractSingleLineDataImporter.isNumber(
      sourceString
    )
      ? Number(sourceString).toString()
      : "";

    if (normalizedString.length > 0 && normalizedString == sourceString) {
      return Number(sourceString) >= 0;
    } else {
      return false;
    }
  }

  /**
   * Удаляем двойные кавычки из строки.
   * @param rawString исходная строка.
   * @returns исходная строка без двойных кавычек.
   */
  protected static removeDoubleQuotations(rawString: string) {
    var processedString: string = "";
    var doubleQuotationMarksArePresent = rawString.indexOf('"');
    if (doubleQuotationMarksArePresent === -1) {
      // нет двойных кавычек
      processedString = rawString;
    } else {
      // есть двойные кавычки, убираем их
      processedString = rawString.replace(/"/g, "");
    }

    return processedString;
  }
}
