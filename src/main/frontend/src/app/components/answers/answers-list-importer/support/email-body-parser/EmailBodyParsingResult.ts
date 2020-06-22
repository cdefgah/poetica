import { AnswerDataModel } from "src/app/model/AnswerDataModel";
import { TeamDataModel } from "src/app/model/TeamDataModel";

export class EmailBodyParsingResult {
  team: TeamDataModel;
  answers: AnswerDataModel[];

  constructor(team: TeamDataModel, answers: AnswerDataModel[]) {
    this.team = team;
    this.answers = answers;
  }
}
