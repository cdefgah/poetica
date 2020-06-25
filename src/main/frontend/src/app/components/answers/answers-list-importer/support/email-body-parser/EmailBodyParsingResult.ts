import { AnswerDataModel } from "src/app/model/AnswerDataModel";
import { TeamDataModel } from "src/app/model/TeamDataModel";

export class EmailBodyParsingResult {
  team: TeamDataModel;
  answers: AnswerDataModel[];
  questionNumbersSequenceString: string;

  constructor(team: TeamDataModel, answers: AnswerDataModel[]) {
    this.team = team;
    this.answers = answers;

    var questionNumbersArray: number[] = [];
    answers.forEach((oneAnswer) =>
      questionNumbersArray.push(oneAnswer.questionNumber)
    );

    this.questionNumbersSequenceString = questionNumbersArray.join(", ");
  }
}
