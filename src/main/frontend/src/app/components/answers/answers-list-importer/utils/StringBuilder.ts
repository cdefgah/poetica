export class StringBuilder {
  private contentLines: string[] = [];

  public addString(string: string) {
    if (string && string.length > 0) {
      this.contentLines.push(string);
    }
  }

  public length(): number {
    return this.contentLines.length;
  }

  public reset(): void {
    this.contentLines = [];
  }

  public toString(): string {
    const delimiter = " // ";
    return this.contentLines.join(delimiter);
  }
}
