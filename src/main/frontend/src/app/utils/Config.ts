/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

// TODO Сделать более удобный механизм логирования
export class Config {
  constructor(public readonly debugMode: boolean) { }
}
export const GlobalConfig = new Config(true);

export function debugString(debugMessage: string) {
  if (GlobalConfig.debugMode) {
    console.log(`.......DEBUG: ${debugMessage}`);
  }
}

export function debugObject(object2Debug: any) {
  if (GlobalConfig.debugMode) {
    console.log('...Object properties in canonical form:');
    console.dir(object2Debug);
    console.log('...Object properties in the table form:');
    console.table(object2Debug);
  }
}
