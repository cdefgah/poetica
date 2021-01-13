/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { PoeticaLogLevel } from './PoeticaLogLevel';

export class PoeticaLogger {
    public static LogLevel: PoeticaLogLevel;

    public static logMessage(message: string) {
        if (PoeticaLogger.LogLevel >= PoeticaLogLevel.DEBUG) {
            console.log(message);
        }
    }

    public static logObjectState(obj: any, description: string) {
        if (PoeticaLogger.LogLevel >= PoeticaLogLevel.DEBUG) {
            console.log('...........................................');
            console.log(description);
            console.log('...........................................');
            console.dir(obj);
            console.log('...........................................');
        }
    }
}

PoeticaLogger.LogLevel = PoeticaLogLevel.DEBUG;
