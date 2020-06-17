import { AbstractMultiLineDataImporter } from "src/app/utils/AbstractMultilineDataImporter";

export class EmailBodyParser extends AbstractMultiLineDataImporter {
  constructor(emailSubject: string) {
    super(emailSubject);
  }
}
