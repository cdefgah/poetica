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

    if (sourceText == null || sourceText.length == 0) {
      throw new Error("Исходный текст для обработки не задан");
    }

    var normalizedString = normalizeString(sourceText);
    this.sourceTextLines = normalizedString.trim().split(this.newLine);
    this.sourceTextLinesIndex = -1;
  }

  public hasNextLine(): boolean {
    return this.sourceTextLinesIndex + 1 < this.sourceTextLines.length;
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
}
