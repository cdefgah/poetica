import { EmailValidationService } from 'src/app/components/core/validators/EmailValidationService';
import { TeamValidationService } from 'src/app/components/core/validators/TeamValidationService';
import { AnswerValidationService } from 'src/app/components/core/validators/AnswerValidationService';
import { HttpClient } from '@angular/common/http';
import { TeamDataModel } from 'src/app/data-model/TeamDataModel';

export class EmailBodyParserParameters {
  parentComponentObject: any;

  emailBody: string;
  emailValidationService: EmailValidationService;
  teamValidationService: TeamValidationService;
  answerValidationService: AnswerValidationService;

  teamFromEmailSubject: TeamDataModel;
  roundNumber: string;

  httpClient: HttpClient;
}
