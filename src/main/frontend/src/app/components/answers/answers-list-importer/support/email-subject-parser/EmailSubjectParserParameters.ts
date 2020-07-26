import { EmailValidationService } from 'src/app/components/core/validators/EmailValidationService';
import { TeamValidationService } from 'src/app/components/core/validators/TeamValidationService';

export class EmailSubjectParserParameters {
  parentComponentObject: any;
  emailSubject: string;
  emailValidationService: EmailValidationService;
  teamValidationService: TeamValidationService;
}
