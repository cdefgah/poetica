import { StringLinesIterator } from "./StringLinesIterator";
import { AbstractSingleLineDataImporter } from "./AbstractSinglelineDataImporter";

export abstract class AbstractMultiLineDataImporter extends AbstractSingleLineDataImporter {
  protected static readonly newLineSurrogate: string = " // ";

  protected readonly sourceTextLinesIterator: StringLinesIterator;

  constructor(sourceString: string) {
    super(sourceString);

    this.sourceTextLinesIterator = new StringLinesIterator(
      this._normalizedSourceString
    );
  }

  protected static introduceNewLineSurrogates(rawString: string): string {
    var sourceString: string = AbstractMultiLineDataImporter.compressSequentialNewLines(
      rawString
    );

    return sourceString.replace(
      /\n/g,
      AbstractMultiLineDataImporter.newLineSurrogate
    );
  }

  protected static compressSequentialNewLines(sourceString: string) {
    return sourceString.replace(/[\r\n]+/g, "\n");
  }
}
