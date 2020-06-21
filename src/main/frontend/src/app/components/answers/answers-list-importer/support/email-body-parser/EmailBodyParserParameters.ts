import { EmailValidationService } from "src/app/components/core/validators/EmailValidationService";
import { TeamValidationService } from "src/app/components/core/validators/TeamValidationService";
import { AnswerValidationService } from "src/app/components/core/validators/AnswerValidationService";
import { EmailSubjectParser } from "../email-subject-parser/EmailSubjectParser";
import { HttpClient } from "@angular/common/http";

export class EmailBodyParserParameters {
  emailBody: string;
  emailValidationService: EmailValidationService;
  teamValidationService: TeamValidationService;
  answerValidationService: AnswerValidationService;
  emailSubjectParser: EmailSubjectParser;
  httpClient: HttpClient;
}
