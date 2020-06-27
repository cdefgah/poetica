import { debugString } from "../utils/Config";

export class EmailDataModel {
  public static emptyEmail: EmailDataModel = new EmailDataModel();

  id: any;
  teamId: number;
  roundNumber: number;
  subject: string;
  body: string;
  sentOn: any;
  importedOn: any;
  questionNumbersSequence: string;
}
