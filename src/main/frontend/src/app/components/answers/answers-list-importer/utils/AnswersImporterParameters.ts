import { HttpClient } from "@angular/common/http";
import { TeamShallowValidationService } from "src/app/components/core/validators/TeamShallowValidationService";
import { EmailShallowValidationService } from "src/app/components/core/validators/EmailShallowValidationService";
import { AnswerShallowValidationService } from "src/app/components/core/validators/AnswerShallowValidationService";
import { RemoteDataValidationService } from "src/app/components/core/validators/RemoteDataValidationService";

export class AnswersImporterParameters {
  http: HttpClient;
  emailSubject: string;
  emailBody: string;

  emailShallowValidationService: EmailShallowValidationService;
  teamShallowValidationService: TeamShallowValidationService;
  answerShallowValidationService: AnswerShallowValidationService;
  remoteDataValidationService: RemoteDataValidationService;
}
