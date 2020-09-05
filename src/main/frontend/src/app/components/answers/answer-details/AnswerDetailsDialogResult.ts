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
