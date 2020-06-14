export abstract class AbstractSingleLineDataImporter {
  protected normalizedSourceString: string;

  constructor(rawSourceText: string) {
    this.normalizedSourceString = AbstractSingleLineDataImporter.normalizeString(
      rawSourceText
    );
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

  protected static isPositiveInteger(sourceString: string): boolean {
    function isNumber(value: string | number): boolean {
      return value != null && value !== "" && !isNaN(Number(value.toString()));
    }

    for (let character of sourceString) {
      if (!isNumber(character)) {
        return false;
      }
    }

    return Number(sourceString) > 0;
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
