export class EmailDataModel {
  public static emptyEmail: EmailDataModel = new EmailDataModel();

  public static createEmailFromMap(
    mapWithValues: Map<string, any>
  ): EmailDataModel {
    var email = new EmailDataModel();

    email.id = mapWithValues["id"];
    email.teamId = mapWithValues["teamId"];
    email.roundNumber = mapWithValues["roundNumber"];
    email.subject = mapWithValues["subject"];
    email.body = mapWithValues["body"];
    email.sentOn = mapWithValues["sentOn"];
    email.importedOn = mapWithValues["importedOn"];
    email.questionNumbersSequence = mapWithValues["questionNumbersSequence"];

    return email;
  }

  id: number;
  teamId: number;
  roundNumber: number;
  subject: string;
  body: string;
  sentOn: any;
  importedOn: any;
  questionNumbersSequence: string;

  get isSubjectPresent(): boolean {
    return this.subject && this.subject.length > 0;
  }
}
