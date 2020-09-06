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
