import { EmailValidationService } from "src/app/components/core/validators/EmailValidationService";
import { TeamValidationService } from "src/app/components/core/validators/TeamValidationService";

export class EmailSubjectParserParameters {
  emailSubject: string;
  emailValidationService: EmailValidationService;
  teamValidationService: TeamValidationService;
}
