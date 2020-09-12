/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

export class AnswersImporterDialogResult {

    public readonly dialogAccepted: boolean;
    public readonly teamId: number;
    public readonly roundAlias: string;

    constructor(dialogAccepted: boolean, teamId: number, roundAlias: string) {
        this.dialogAccepted = dialogAccepted;
        this.teamId = teamId;
        this.roundAlias = roundAlias;
    }
}
