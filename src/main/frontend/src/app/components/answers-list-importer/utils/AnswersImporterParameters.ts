import { HttpClient } from "@angular/common/http";

export class AnswersImporterParameters {
  http: HttpClient;
  emailSubject: string;
  emailBody: string;
  teamModelConstraints: Map<string, number>;
  emailModelConstraints: Map<string, number>;
  answerModelConstraints: Map<string, number>;
}
