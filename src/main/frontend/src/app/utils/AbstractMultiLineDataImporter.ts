import { StringLinesIterator } from './StringLinesIterator';
import { AbstractSingleLineDataImporter } from './AbstractSinglelineDataImporter';

export abstract class AbstractMultiLineDataImporter extends AbstractSingleLineDataImporter {
  protected static readonly newline = '\n';
  protected readonly sourceTextLinesIterator: StringLinesIterator;

  constructor(sourceString: string, onSuccess: Function, onFailure: Function) {
    super(sourceString, onSuccess, onFailure);

    this.sourceTextLinesIterator = new StringLinesIterator(
      this.normalizedSourceString
    );
  }

  protected static compressSequentialNewLines(sourceString: string) {
    return sourceString.replace(/[\r\n]+/g, this.newline);
  }
}
