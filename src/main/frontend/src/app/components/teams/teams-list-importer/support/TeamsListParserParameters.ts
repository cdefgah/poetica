/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { HttpClient } from '@angular/common/http';
import { TeamValidationService } from '../../../core/validators/TeamValidationService';

export class TeamsListParserParameters {
  parentComponentObject: any;
  textWithTeamsList: string;
  teamValidationService: TeamValidationService;
  httpClient: HttpClient;
}
