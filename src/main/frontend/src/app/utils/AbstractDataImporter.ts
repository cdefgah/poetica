import { StringLinesIterator } from "./StringLinesIterator";

export abstract class AbstractDataImporter {
  protected sourceTextLinesIterator: StringLinesIterator;

  constructor(sourceString: string) {
    this.sourceTextLinesIterator = new StringLinesIterator(sourceString);
  }

  protected static isPositiveInteger(sourceString: string): boolean {
    function isNumber(value: string | number): boolean {
      return value != null && value !== "" && !isNaN(Number(value.toString()));
    }

    for (let character of sourceString) {
      if (!isNumber(character)) {
        return false;
      }
    }

    return Number(sourceString) > 0;
  }
}
