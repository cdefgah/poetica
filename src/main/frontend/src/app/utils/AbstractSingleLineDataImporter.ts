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

  protected static isZeroOrPositiveInteger(sourceString: string, allowLeadingZeroes: boolean = false): boolean {
    if (allowLeadingZeroes) {
      sourceString = sourceString.trim();
      if (!sourceString) {
          return false;
      }
      sourceString = sourceString.replace(/^0+/, '') || '0';
    }

    const n = Math.floor(Number(sourceString));
    return n !== Infinity && String(n) === sourceString && n >= 0;
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
