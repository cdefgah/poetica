import { TeamDataModel } from "src/app/model/TeamDataModel";
import { AnswersImporterParameters } from "./AnswersImporterParameters";
import { EmailSubjectParser } from "./EmailSubjectParser";
import { EmailBodyParser } from "./EmailBodyParser";
import { debugString } from "src/app/utils/Config";

export class AnswersImporter {
  private readonly _emailSubjectParser: EmailSubjectParser;
  private readonly _emailBodyParser: EmailBodyParser;

  private _foundErrors: string[];

  constructor(parameters: AnswersImporterParameters) {
    debugString("AnswersImporter constructor:: Start");

    debugString("AnswersImporter. Constructing _emailSubjectParser: start");
    this._emailSubjectParser = new EmailSubjectParser(
      parameters.emailSubject,
      parameters.emailShallowValidationService,
      parameters.teamShallowValidationService
    );
    debugString(
      `AnswersImporter. Constructing _emailSubjectParser: end. Errors present? ${this._emailSubjectParser.errorsPresent}`
    );

    if (this._emailSubjectParser.errorsPresent) {
      debugString(
        `AnswersImporter. Registering _emailSubjectParser errors: ${this._emailSubjectParser.foundErrors} and exiting.`
      );
      this.registerFoundErrors(this._emailSubjectParser.foundErrors);
      return;
    }

    debugString("AnswersImporter. Constructing _emailBodyParser: start");
    this._emailBodyParser = new EmailBodyParser(
      parameters.emailBody,
      parameters.emailShallowValidationService,
      parameters.teamShallowValidationService,
      this._emailSubjectParser.team,
      parameters.http
    );
    debugString(
      `AnswersImporter. Constructing _emailBodyParser: end. Errors present? ${this._emailBodyParser.errorsPresent}`
    );

    if (this._emailBodyParser.errorsPresent) {
      debugString(
        `AnswersImporter. Registering _emailBodyParser errors: ${this._emailBodyParser.foundErrors} and exiting.`
      );
      this.registerFoundErrors(this._emailBodyParser.foundErrors);
      return;
    }

    debugString("AnswersImporter constructor:: correct END");
  }

  private registerFoundErrors(foundErrorsArray: string[]) {
    if (this._foundErrors) {
      this._foundErrors = this._foundErrors.concat(foundErrorsArray);
    } else {
      this._foundErrors = foundErrorsArray;
    }
  }

  get errorsPresent(): boolean {
    if (this._foundErrors) {
      return this._foundErrors.length > 0;
    } else {
      return false;
    }
  }

  get foundErrors(): string[] {
    return this._foundErrors;
  }

  public async parse() {
    debugString("AnswersImporter parse() method:: Start");

    debugString(
      "AnswersImporter parse() method, calling this._emailSubjectParser.parseEmailSubject()"
    );
    this._emailSubjectParser.parseEmailSubject();

    debugString(
      `AnswersImporter parse() method, after calling this._emailSubjectParser.parseEmailSubject(), errorsPresent? ${this._emailSubjectParser.errorsPresent}`
    );
    if (this._emailSubjectParser.errorsPresent) {
      debugString(
        `AnswersImporter parse() method, after calling this._emailSubjectParser.parseEmailSubject() registering errors: ${this._emailSubjectParser.foundErrors}`
      );
      this.registerFoundErrors(this._emailSubjectParser.foundErrors);
      return;
    }

    debugString(
      "AnswersImporter parse() method, calling this._emailSubjectParser.parseEmailBody()"
    );
    this._emailBodyParser.parseEmailBody();
    debugString(
      `AnswersImporter parse() method, after calling this._emailSubjectParser.parseEmailBody() errorsPresent? ${this._emailBodyParser.errorsPresent}`
    );

    if (this._emailBodyParser.errorsPresent) {
      debugString(
        `AnswersImporter parse() method, after calling this._emailSubjectParser.parseEmailBody() registering errors ${this._emailBodyParser.foundErrors}`
      );
      this.registerFoundErrors(this._emailBodyParser.foundErrors);
      return;
    }

    debugString("AnswersImporter parse() method:: Correct END");
  }

  public getRoundNumber(): string {
    return this._emailSubjectParser.roundNumber;
  }

  public getTeamFromEmailSubject(): TeamDataModel {
    return this._emailSubjectParser.team;
  }
}
