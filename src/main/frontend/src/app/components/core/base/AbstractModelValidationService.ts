/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

/**
 * Абстрактный класс для разных валидаций моделей данных.
 */
export abstract class AbstractModelValidationService {
  // используется в случае поломок, для хранения описания, что сломалось
  protected _brokenStateDescription: string = "";

  constructor() { }

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

  protected static isNumber(value: string | number): boolean {
    return value != null && value !== "" && !isNaN(Number(value.toString()));
  }
}
