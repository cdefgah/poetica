/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

/**
 * Хранит результат вычисления чего-нибудь.
 * Также, если произошла ошибка, хранит информацию об этом.
 */
export class CalculationResult {
  public readonly resultObject: any;
  public readonly errorMessage: string;

  constructor(resultObject: any, errorMessage: string) {
    this.resultObject = resultObject;
    this.errorMessage = errorMessage;
  }

  public get errorsPresent(): boolean {
    return this.errorMessage && this.errorMessage.length > 0;
  }
}
