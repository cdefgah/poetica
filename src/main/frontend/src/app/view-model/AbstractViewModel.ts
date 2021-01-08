/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

export class AbstractViewModel {
  protected static readonly newline = '\n';

  protected static compressSequentialNewLines(sourceString: string) {
    return sourceString.replace(/[\r\n]+/g, this.newline);
  }

  protected replaceNewLinesWithSurrogate(stringWithNewLines: string): string {
    const normalizedString = AbstractViewModel.compressSequentialNewLines(stringWithNewLines);
    return normalizedString.replace(/(?:\r\n|\r|\n)/g, ' // ');
  }
}
