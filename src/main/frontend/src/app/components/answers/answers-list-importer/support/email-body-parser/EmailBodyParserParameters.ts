/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { EmailValidationService } from 'src/app/components/core/validators/EmailValidationService';
import { AnswerValidationService } from 'src/app/components/core/validators/AnswerValidationService';
import { HttpClient } from '@angular/common/http';

export class EmailBodyParserParameters {
  parentComponentObject: any;

  emailBody: string;
  emailValidationService: EmailValidationService;
  answerValidationService: AnswerValidationService;

  httpClient: HttpClient;
}
