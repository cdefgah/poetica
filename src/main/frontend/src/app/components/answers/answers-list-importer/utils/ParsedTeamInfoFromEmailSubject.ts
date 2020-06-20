import { TeamDataModel } from "src/app/model/TeamDataModel";

export class ParsedTeamInfoFromEmailSubject {
  private _isEmpty: boolean;
  private _team: TeamDataModel;

  constructor(isEmpty: boolean, team: TeamDataModel) {
    this._isEmpty = isEmpty;
    this._team = team;
  }

  get isEmpty() {
    return this._isEmpty;
  }

  get team() {
    return this._team;
  }
}
