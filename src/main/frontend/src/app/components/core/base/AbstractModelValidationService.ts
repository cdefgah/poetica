/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

/**
 * Абстрактный класс для разных валидаций моделей данных.
 */
export abstract class AbstractModelValidationService {
  // используется в случае поломок, для хранения описания, что сломалось
  public brokenStateDescription = '';

  protected static isNumber(value: string | number): boolean {
    return value != null && value !== '' && !isNaN(Number(value.toString()));
  }

  constructor() { }

  protected setBrokenInternalState(description: string) {
    this.brokenStateDescription = description;
  }

  public isInternalStateCorrect() {
    return !(
      this.brokenStateDescription && this.brokenStateDescription.length > 0
    );
  }
}
