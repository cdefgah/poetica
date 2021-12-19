/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

export abstract class AbstractSingleLineDataImporter {
  protected static readonly rtfmMessage = 'Ознакомьтесь, пожалуйста, с требованиями к формату текста.';

  protected parentComponentObject: any;

  protected normalizedSourceString: string;

  protected onSuccess: Function;
  protected onFailure: Function;

  constructor(rawSourceText: string, onSuccess: Function, onFailure: Function) {
    this.normalizedSourceString = AbstractSingleLineDataImporter.normalizeString(rawSourceText);

    this.onSuccess = onSuccess;
    this.onFailure = onFailure;
  }

  /**
   * Заменяет символы кавычек и дефисов на унифицированный символ,
   * для стандартизации текста перед обработкой.
   * @param sourceString исходная строка для обработки.
   * @returns нормализованная строка.
   */
  protected static normalizeString(sourceString: string): string {
    if (!sourceString || sourceString.length === 0) {
      return '';
    }

    // убираем ненужные символы
    let processedString: string = sourceString.replace(/[¶]/g, '');

    // нормализуем кавычки
    processedString = processedString.replace(/[‘’“”„‹›'»«]/g, '"');

    // нормализуем тире и дефисы
    processedString = processedString.replace(/[-֊־᠆‐‒–—―⸺⸻〰﹘﹣－]/g, '-');

    return processedString;
  }

  private static isNumber(value: string | number): boolean {
    return value != null && value !== '' && !isNaN(Number(value.toString()));
  }

  protected static isZeroOrPositiveInteger(sourceString: string): boolean {
    // нормализация нужна, чтобы исключить случаи, когда перед нулём дали символ минуса или плюса
    // или дали два или более нулей в качестве исходной строки.
    const normalizedString: string = AbstractSingleLineDataImporter.isNumber(sourceString) ?
                                        AbstractSingleLineDataImporter.parseInt(sourceString).toString() : '';

    return (normalizedString.length > 0) && (normalizedString === sourceString)
                                              && (AbstractSingleLineDataImporter.parseInt(sourceString) >= 0);
  }

  /**
   * Удаляем двойные кавычки из строки.
   * @param rawString исходная строка.
   * @returns исходная строка без двойных кавычек.
   */
  protected static removeDoubleQuotations(rawString: string) {
    let processedString = '';
    const doubleQuotationMarksArePresent = rawString.indexOf('"');
    if (doubleQuotationMarksArePresent === -1) {
      // нет двойных кавычек
      processedString = rawString;
    } else {
      // есть двойные кавычки, убираем их
      processedString = rawString.replace(/"/g, '');
    }

    return processedString;
  }

  protected static parseInt(stringValue: string): number {
    return parseInt(stringValue, 10);
  }

  protected static startsWithIgnoringCase(originalString: string, prefixToCheck: string): boolean {
    return originalString.toUpperCase().startsWith(prefixToCheck.toUpperCase());
  }
}
