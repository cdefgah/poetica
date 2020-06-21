import { StringLinesIterator } from "./StringLinesIterator";
import { AbstractSingleLineDataImporter } from "./AbstractSinglelineDataImporter";

export abstract class AbstractMultiLineDataImporter extends AbstractSingleLineDataImporter {
  protected static readonly _newLineSurrogate: string = " // ";

  protected readonly _sourceTextLinesIterator: StringLinesIterator;

  constructor(sourceString: string) {
    super(sourceString);

    this._sourceTextLinesIterator = new StringLinesIterator(
      this.normalizedSourceString
    );
  }

  protected static introduceNewLineSurrogates(rawString: string): string {
    var sourceString: string = AbstractMultiLineDataImporter.compressSequentialNewLines(
      rawString
    );

    return sourceString.replace(
      /\n/g,
      AbstractMultiLineDataImporter._newLineSurrogate
    );
  }

  protected static compressSequentialNewLines(sourceString: string) {
    return sourceString.replace(/[\r\n]+/g, "\n");
  }
}
