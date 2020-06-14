import { Team } from "src/app/model/Team";
import { AbstractSingleLineDataImporter } from "src/app/utils/AbstractSinglelineDataImporter";

export class EmailSubject extends AbstractSingleLineDataImporter {
  private readonly team: Team;
  private readonly roundNumber: string;

  constructor(emailSubject: string) {
    super(emailSubject);
  }

  public getTeam(): Team {
    return this.team;
  }

  public getRoundNumber(): string {
    return this.roundNumber;
  }

  private parseEmailSubject() {}
}
