import { HttpClient } from "@angular/common/http";

export class AnswersImporterParameters {
  http: HttpClient;
  emailSubject: string;
  emailBody: string;
  emailModelConstraints: Map<string, number>;
  answerModelConstraints: Map<string, number>;
}
