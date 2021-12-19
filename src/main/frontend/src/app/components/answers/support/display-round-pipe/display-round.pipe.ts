/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayRound',
})
export class DisplayRoundPipe implements PipeTransform {
  transform(value: number): string {
    if (value === 1) {
      return 'Предварительный';
    } else if (value === 2) {
      return 'Окончательный';
    } else {
      return '???';
    }
  }
}
