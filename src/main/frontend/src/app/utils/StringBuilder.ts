/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

export class StringBuilder {
  private static readonly newline = '\n';
  private contentLines: string[] = [];

  public addString(stringValue: string) {
    if (stringValue && stringValue.length > 0) {
      this.contentLines.push(stringValue);
    }
  }

  public length(): number {
    return this.toString().length;
  }

  public reset(): void {
    this.contentLines = [];
  }

  public toString(): string {
    return this.contentLines.join(StringBuilder.newline);
  }
}
