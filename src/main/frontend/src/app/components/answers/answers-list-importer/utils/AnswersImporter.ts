import { TeamDataModel } from "src/app/model/TeamDataModel";
import { AnswersImporterParameters } from "./AnswersImporterParameters";
import { EmailSubjectParser } from "./EmailSubjectParser";
import { EmailBodyParser } from "./EmailBodyParser";

export class AnswersImporter {
  private readonly _emailSubjectParser: EmailSubjectParser;
  private readonly _emailBodyParser: EmailBodyParser;

  private _foundErrors: string[];

  constructor(parameters: AnswersImporterParameters) {
    this._emailSubjectParser = new EmailSubjectParser(
      parameters.emailSubject,
      parameters.emailShallowValidationService,
      parameters.teamShallowValidationService
    );

    if (this._emailSubjectParser.errorsPresent) {
      this.registerFoundErrors(this._emailSubjectParser.foundErrors);
      return;
    }

    this._emailBodyParser = new EmailBodyParser(
      parameters.emailBody,
      parameters.emailShallowValidationService,
      parameters.teamShallowValidationService,
      this._emailSubjectParser.team,
      parameters.http
    );

    if (this._emailBodyParser.errorsPresent) {
      this.registerFoundErrors(this._emailBodyParser.foundErrors);
      return;
    }
  }

  private registerFoundErrors(foundErrorsArray: string[]) {
    if (this._foundErrors) {
      this._foundErrors = this._foundErrors.concat(foundErrorsArray);
    } else {
      this._foundErrors = foundErrorsArray;
    }
  }

  get errorsPresent(): boolean {
    return this._foundErrors && this._foundErrors.length > 0;
  }

  get foundErrors(): string[] {
    return this._foundErrors;
  }

  public async parse() {
    this._emailSubjectParser.parseEmailSubject();
    if (this.errorsPresent) {
      return;
    }

    this._emailBodyParser.parseEmailBody();
    if (this.errorsPresent) {
      return;
    }
  }

  public getRoundNumber(): string {
    return this._emailSubjectParser.roundNumber;
  }

  public getTeamFromEmailSubject(): TeamDataModel {
    return this._emailSubjectParser.team;
  }
}
