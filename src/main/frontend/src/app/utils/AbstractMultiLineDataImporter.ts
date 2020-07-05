import { StringLinesIterator } from "./StringLinesIterator";
import { AbstractSingleLineDataImporter } from "./AbstractSinglelineDataImporter";

export abstract class AbstractMultiLineDataImporter extends AbstractSingleLineDataImporter {
  protected static readonly newline = "\n";
  protected readonly _sourceTextLinesIterator: StringLinesIterator;

  constructor(sourceString: string, onSuccess: Function, onFailure: Function) {
    super(sourceString, onSuccess, onFailure);

    this._sourceTextLinesIterator = new StringLinesIterator(
      this.normalizedSourceString
    );
  }

  protected static compressSequentialNewLines(sourceString: string) {
    return sourceString.replace(/[\r\n]+/g, "\n");
  }
}
