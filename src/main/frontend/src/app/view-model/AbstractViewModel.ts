export class AbstractViewModel {
  protected compressNewLines(stringWithNewLines: string): string {
    return stringWithNewLines.replace("\n", " // ");
  }
}
