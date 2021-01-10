/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { HttpClient } from '@angular/common/http';
import { EmailValidationService } from '../../../../core/validators/EmailValidationService';
import { AnswerValidationService } from '../../../../core/validators/AnswerValidationService';

export class EmailBodyParserParameters {
  parentComponentObject: any;

  emailBody: string;
  emailValidationService: EmailValidationService;
  answerValidationService: AnswerValidationService;

  httpClient: HttpClient;
}
