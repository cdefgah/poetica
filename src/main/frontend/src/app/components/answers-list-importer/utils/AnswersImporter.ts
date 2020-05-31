import { AbstractDataImporter } from "src/app/utils/AbstractDataImporter";

export class AnswersImporter extends AbstractDataImporter {
  constructor(
    emailSubject: string,
    emailBody: string,
    emailModelConstraints: Map<string, number>,
    answerModelConstraints: Map<string, number>
  ) {
    super(emailBody);
  }
}
