export class StringLinesIterator {
  protected static readonly newLine: string = '\n';

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
      let processedString: string = string2Process.replace(/[\r\n]+/g, StringLinesIterator.newLine);

      // удаляем ненужные символы
      processedString = processedString.replace(/[¶]/g, '');

      // кавычки в порядок приводим
      processedString = processedString.replace(/[‘’“”„‹›'»«]/g, '"');

      // дефисы причёсываем
      processedString = processedString.replace(/[-֊־᠆‐‒–—―⸺⸻〰﹘﹣－]/g, '-');

      return processedString;
    }

    this.sourceTextLinesIndex = -1;
    if (sourceText) {
      if (sourceText.length > 0) {
        const normalizedString = normalizeString(sourceText);
        this.sourceTextLines = normalizedString.trim().split(StringLinesIterator.newLine);
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

  public nextLine(increaseIndex: boolean = true): string {
    if (this.hasNextLine()) {
      this.sourceTextLinesIndex++;
      const resultString = this.sourceTextLines[this.sourceTextLinesIndex].trim();

      // в некоторых случаях нам надо получить строку
      // но не сдвигать индекс вперед
      // например для проверки начала следующего сегмента
      if (!increaseIndex) {
        this.sourceTextLinesIndex--;
      }

      return resultString;

    } else {
      throw new Error(
        'Исходный текст обработан полностью, но сделана попытка прочитать следующую строку из него.'
      );
    }
  }
}
