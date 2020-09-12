/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { TeamValidationService } from 'src/app/components/core/validators/TeamValidationService';
import { HttpClient } from '@angular/common/http';

export class TeamsListParserParameters {
  parentComponentObject: any;
  textWithTeamsList: string;
  teamValidationService: TeamValidationService;
  httpClient: HttpClient;
}
