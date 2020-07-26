export class AbstractViewModel {
  protected static readonly newline = '\n';

  protected static compressSequentialNewLines(sourceString: string) {
    return sourceString.replace(/[\r\n]+/g, this.newline);
  }

  protected replaceNewLinesWithSurrogate(stringWithNewLines: string): string {
    const normalizedString = AbstractViewModel.compressSequentialNewLines(stringWithNewLines);
    return normalizedString.replace(/(?:\r\n|\r|\n)/g, ' // ');
  }
}
