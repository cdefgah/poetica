import { TeamDataModel } from "src/app/model/TeamDataModel";
import { AbstractSingleLineDataImporter } from "src/app/utils/AbstractSinglelineDataImporter";

export class EmailSubject extends AbstractSingleLineDataImporter {
  private readonly team: TeamDataModel;
  private readonly roundNumber: string;

  constructor(emailSubject: string) {
    super(emailSubject);
  }

  public getTeam(): TeamDataModel {
    return this.team;
  }

  public getRoundNumber(): string {
    return this.roundNumber;
  }

  private parseEmailSubject() {}
}
