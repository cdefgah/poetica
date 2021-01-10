import { TeamDataModel } from '../../../../../data-model/TeamDataModel';
import { AnswerDataModel } from '../../../../../data-model/AnswerDataModel';
/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */


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
