export class StringLinesIterator {
  protected readonly newLine: string = "\n";

  protected sourceTextLines: string[];

  protected sourceTextLinesIndex: number;

  constructor(sourceText: string) {
    /**
     * Нормализует строку, удаляет ненужные символы, приводит в порядок разнобой в символах.
     * @param string2Process строка к обработке.
     * @returns обработанная строка.
     */
    function normalizeString(string2Process: string): string {
      // сжимаем последовательные переносы (пустые строки) в один
      var processedString: string = string2Process.replace(/[\r\n]+/g, "\n");

      // удаляем ненужные символы
      processedString = processedString.replace(/[¶]/g, "");

      // кавычки в порядок приводим
      processedString = processedString.replace(/[‘’“”„‹›'»«]/g, '"');

      // дефисы причёсываем
      processedString = processedString.replace(/[-֊־᠆‐‒–—―⸺⸻〰﹘﹣－]/g, "-");

      return processedString;
    }

    this.sourceTextLinesIndex = -1;
    if (sourceText) {
      if (sourceText.length > 0) {
        var normalizedString = normalizeString(sourceText);
        this.sourceTextLines = normalizedString.trim().split(this.newLine);
      }
    }
  }

  public hasNextLine(): boolean {
    if (this.sourceTextLines) {
      return this.sourceTextLinesIndex + 1 < this.sourceTextLines.length;
    } else {
      return false;
    }
  }

  public nextLine(): string {
    if (this.hasNextLine()) {
      this.sourceTextLinesIndex++;
      return this.sourceTextLines[this.sourceTextLinesIndex].trim();
    } else {
      throw new Error(
        "Исходный текст обработан полностью, но сделана попытка прочитать следующую строку из него."
      );
    }
  }

  public stepIndexBack() {
    if (this.sourceTextLinesIndex > 0) {
      this.sourceTextLinesIndex--;
    }
  }
}
