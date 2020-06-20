import { EmailShallowValidationService } from "src/app/components/core/validators/EmailShallowValidationService";
import { TeamShallowValidationService } from "src/app/components/core/validators/TeamShallowValidationService";
import { AnswerShallowValidationService } from "src/app/components/core/validators/AnswerShallowValidationService";
import { EmailSubjectParser } from "./EmailSubjectParser";
import { HttpClient } from "@angular/common/http";

export class EmailBodyParserParameters {
  emailBody: string;
  emailValidationService: EmailShallowValidationService;
  teamValidationService: TeamShallowValidationService;
  answerValidationService: AnswerShallowValidationService;
  emailSubjectParser: EmailSubjectParser;
  httpClient: HttpClient;
}
