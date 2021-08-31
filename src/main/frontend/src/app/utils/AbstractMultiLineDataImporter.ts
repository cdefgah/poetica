/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { StringLinesIterator } from './StringLinesIterator';
import { AbstractSingleLineDataImporter } from './AbstractSingleLineDataImporter';


export abstract class AbstractMultiLineDataImporter extends AbstractSingleLineDataImporter {
  protected static readonly newline = '\n';
  protected readonly sourceTextLinesIterator: StringLinesIterator;

  constructor(sourceString: string, onSuccess: Function, onFailure: Function) {
    super(sourceString, onSuccess, onFailure);

    this.sourceTextLinesIterator = new StringLinesIterator(
      this.normalizedSourceString
    );
  }

  protected static compressSequentialNewLines(sourceString: string) {
    return sourceString.replace(/[\r\n]+/g, this.newline);
  }
}
