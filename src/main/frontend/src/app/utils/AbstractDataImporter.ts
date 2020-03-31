export abstract class AbstractDataImporter {
  private isNumber(value: string | number): boolean {
    return value != null && value !== "" && !isNaN(Number(value.toString()));
  }

  protected isPositiveInteger(sourceString: string): boolean {
    for (let character of sourceString) {
      if (!this.isNumber(character)) {
        return false;
      }
    }

    return Number(sourceString) > 0;
  }
}
