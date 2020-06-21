import { TeamDataModel } from "src/app/model/TeamDataModel";
import { AnswersImporterParameters } from "./AnswersImporterParameters";
import { EmailSubjectParser } from "../email-subject-parser/EmailSubjectParser";
import { EmailBodyParser } from "../email-body-parser/EmailBodyParser";
import { debugString } from "src/app/utils/Config";
import { EmailBodyParserParameters } from "../email-body-parser/EmailBodyParserParameters";

export class AnswersImporter {
  private readonly _emailSubjectParser: EmailSubjectParser;
  private readonly _emailBodyParser: EmailBodyParser;

  constructor(
    parameters: AnswersImporterParameters,
    onSuccess: Function,
    onFailure: Function
  ) {
    this._emailSubjectParser = new EmailSubjectParser(
      parameters.emailSubject,
      parameters.emailValidationService,
      parameters.teamValidationService
    );

    // if (this._emailSubjectParser.errorsPresent) {
    //   this.registerFoundErrors(this._emailSubjectParser.foundErrors);
    //   return;
    // }

    var emailBodyParserParameters = new EmailBodyParserParameters();
    emailBodyParserParameters.emailBody = parameters.emailBody;
    emailBodyParserParameters.emailValidationService =
      parameters.emailValidationService;
    emailBodyParserParameters.teamValidationService =
      parameters.teamValidationService;
    emailBodyParserParameters.answerValidationService =
      parameters.answerValidationService;
    emailBodyParserParameters.httpClient = parameters.httpClient;

    emailBodyParserParameters.emailSubjectParser = this._emailSubjectParser;

    this._emailBodyParser = new EmailBodyParser(emailBodyParserParameters);

    // if (this._emailBodyParser.errorsPresent) {
    //   this.registerFoundErrors(this._emailBodyParser.foundErrors);
    //   return;
    // }
  }

  public async parse() {
    this._emailSubjectParser.parseEmailSubject();

    // if (this._emailSubjectParser.errorsPresent) {
    //   this.registerFoundErrors(this._emailSubjectParser.foundErrors);
    //   return;
    // }

    this._emailBodyParser.parseEmailBody();

    // if (this._emailBodyParser.errorsPresent) {
    //   this.registerFoundErrors(this._emailBodyParser.foundErrors);
    //   return;
    // }
  }

  public getRoundNumber(): string {
    return this._emailSubjectParser.roundNumber;
  }

  public getTeamFromEmailSubject(): TeamDataModel {
    return this._emailSubjectParser.team;
  }
}
