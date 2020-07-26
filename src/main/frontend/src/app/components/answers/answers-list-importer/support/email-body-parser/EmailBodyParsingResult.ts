import { AnswerDataModel } from 'src/app/data-model/AnswerDataModel';
import { TeamDataModel } from 'src/app/data-model/TeamDataModel';

export class EmailBodyParsingResult {
  team: TeamDataModel;
  answers: AnswerDataModel[];
  questionNumbersSequenceString: string;

  constructor(team: TeamDataModel, answers: AnswerDataModel[]) {
    this.team = team;
    this.answers = answers;

    const questionNumbersArray: number[] = [];
    answers.forEach((oneAnswer) =>
      questionNumbersArray.push(oneAnswer.questionNumber)
    );

    this.questionNumbersSequenceString = questionNumbersArray.join(', ');
  }
}
