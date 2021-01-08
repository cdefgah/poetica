/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

export class EmailDataModel {

  get isSubjectPresent(): boolean {
    return this.subject && this.subject.length > 0;
  }
  public static emptyEmail: EmailDataModel = new EmailDataModel();

  id: number;
  teamId: number;
  roundNumber: number;
  subject: string;
  body: string;
  sentOn: any;
  importedOn: any;
  questionNumbersSequence: string;

  public static createEmailFromMap(mapWithValues: Map<string, any>): EmailDataModel {
    const email = new EmailDataModel();

    email.id = mapWithValues['id'];
    email.teamId = mapWithValues['teamId'];
    email.roundNumber = mapWithValues['roundNumber'];
    email.subject = mapWithValues['subject'];
    email.body = mapWithValues['body'];
    email.sentOn = mapWithValues['sentOn'];
    email.importedOn = mapWithValues['importedOn'];
    email.questionNumbersSequence = mapWithValues['questionNumbersSequence'];

    return email;
  }
}
