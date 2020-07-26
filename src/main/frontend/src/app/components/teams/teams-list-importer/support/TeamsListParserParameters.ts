import { TeamValidationService } from 'src/app/components/core/validators/TeamValidationService';
import { HttpClient } from '@angular/common/http';

export class TeamsListParserParameters {
  parentComponentObject: any;
  textWithTeamsList: string;
  teamValidationService: TeamValidationService;
  httpClient: HttpClient;
}
