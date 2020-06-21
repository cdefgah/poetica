import { HttpClient } from "@angular/common/http";
import { TeamValidationService } from "src/app/components/core/validators/TeamValidationService";
import { EmailValidationService } from "src/app/components/core/validators/EmailValidationService";
import { AnswerValidationService } from "src/app/components/core/validators/AnswerValidationService";

export class AnswersImporterParameters {
  httpClient: HttpClient;
  emailSubject: string;
  emailBody: string;

  emailValidationService: EmailValidationService;
  teamValidationService: TeamValidationService;
  answerValidationService: AnswerValidationService;
}
