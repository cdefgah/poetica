import { HttpClient } from "@angular/common/http";

export class AnswersImporterParameters {
  http: HttpClient;
  emailSubject: string;
  emailBody: string;
}
