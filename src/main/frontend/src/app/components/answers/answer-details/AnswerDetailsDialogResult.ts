/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

export class AnswerDetailsDialogResult {
    public readonly gradeOnDialogOpen: string;
    public readonly gradeOnDialogClose: string;

    constructor(gradeOnDialogOpen: string, gradeOnDialogClose: string) {
        this.gradeOnDialogOpen = gradeOnDialogOpen;
        this.gradeOnDialogClose = gradeOnDialogClose;
    }

    public get gradeSetToNonGradedAnswer(): boolean {
        return this.gradeOnDialogOpen === 'None';
    }

    public get noChangesWereMade(): boolean {
        return this.gradeOnDialogOpen === this.gradeOnDialogClose;
    }
}
