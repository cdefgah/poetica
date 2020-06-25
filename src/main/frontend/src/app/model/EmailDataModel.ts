import { debugString } from "../utils/Config";

export class EmailDataModel {
  id: any;
  teamId: number;
  roundNumber: number;
  subject: string;
  body: string;
  sentOn: any;
  importedOn: any;
  questionNumbersSequence: string;
}
