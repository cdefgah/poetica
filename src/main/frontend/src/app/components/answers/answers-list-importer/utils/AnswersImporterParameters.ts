import { HttpClient } from "@angular/common/http";
import { TeamShallowValidationService } from "src/app/components/core/validators/TeamShallowValidationService";
import { EmailShallowValidationService } from "src/app/components/core/validators/EmailShallowValidationService";
import { AnswerShallowValidationService } from "src/app/components/core/validators/AnswerShallowValidationService";

export class AnswersImporterParameters {
  httpClient: HttpClient;
  emailSubject: string;
  emailBody: string;

  emailShallowValidationService: EmailShallowValidationService;
  teamShallowValidationService: TeamShallowValidationService;
  answerShallowValidationService: AnswerShallowValidationService;
}
