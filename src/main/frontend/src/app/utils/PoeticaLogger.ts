/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { PoeticaLogLevel } from './PoeticaLogLevel';

export class PoeticaLogger {
    public static LogLevel: PoeticaLogLevel = PoeticaLogLevel.DEBUG;

    public static logMessage(message: string) {
        if (PoeticaLogger.LogLevel >= PoeticaLogLevel.DEBUG) {
            console.log(message);
        }
    }

    public static logObjectState(obj: any, description: string) {
        if (PoeticaLogger.LogLevel >= PoeticaLogLevel.DEBUG) {
            const delimiter = '...........................................';
            console.log(delimiter);
            console.log(description);
            console.log(delimiter);
            console.dir(obj);
            console.log(delimiter);
        }
    }
}
