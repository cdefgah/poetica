import { TeamDataModel } from "src/app/model/TeamDataModel";
import { AnswersImporterParameters } from "./AnswersImporterParameters";
import { HttpClient } from "@angular/common/http";
import { EmailSubjectParser } from "./EmailSubjectParser";

export class AnswersImporter {
  private _emailSubjectParser: EmailSubjectParser;

  private _foundErrors: string[];

  constructor(parameters: AnswersImporterParameters) {
    this._emailSubjectParser = new EmailSubjectParser(
      parameters.emailSubject,
      parameters.emailShallowValidationService,
      parameters.teamShallowValidationService
    );

    if (this._emailSubjectParser.errorsPresent) {
      this.registerFoundErrors(this._emailSubjectParser.foundErrors);
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

  public async parse() {}

  public getRoundNumber(): string {
    return this._emailSubjectParser.roundNumber;
  }

  public getTeamFromEmailSubject(): TeamDataModel {
    return this._emailSubjectParser.team;
  }
}
