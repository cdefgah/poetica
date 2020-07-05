export class StringBuilder {
  private static readonly newline = "\n";
  private contentLines: string[] = [];

  public addString(string: string) {
    if (string && string.length > 0) {
      this.contentLines.push(string);
    }
  }

  public length(): number {
    return this.toString().length;
  }

  public reset(): void {
    this.contentLines = [];
  }

  public toString(): string {
    return this.contentLines.join(StringBuilder.newline);
  }
}
