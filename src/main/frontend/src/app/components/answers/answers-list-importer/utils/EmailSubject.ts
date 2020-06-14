import { AbstractDataImporter } from "src/app/utils/AbstractDataImporter";

export class EmailSubject extends AbstractDataImporter {
  constructor(emailSubject: string) {
    super(emailSubject);
  }
}
