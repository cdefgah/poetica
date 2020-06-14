import { AbstractDataImporter } from "src/app/utils/AbstractDataImporter";
import { Team } from "src/app/model/Team";

export class EmailSubject extends AbstractDataImporter {
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
}
