/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { DisplayRoundPipe } from './display-round.pipe';

describe('DisplayRoundPipe', () => {
  it('create an instance', () => {
    const pipe = new DisplayRoundPipe();
    expect(pipe).toBeTruthy();
  });
});
