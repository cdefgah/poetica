/**
 * Модель данных команды.
 */
export class Team {
  /**
   * Используется в случаях, когда нет информации о команде,
   * чтобы не создавать новых экземпляров класса.
   */
  public static emptyTeam: Team = new Team("", "");

  /**
   * Уникальный номер команды.
   */
  number: string = "";

  /**
   * Название команды.
   */
  title: string = "";

  /**
   * Конструктор класса.
   * @param number уникальный номер команды.
   * @param title название команды.
   */
  constructor(number: string, title: string) {
    const expectedTeamNumberLength = 3;

    if (number.length > 0) {
      if (this.isPositiveInteger(number)) {
        if (number.length != expectedTeamNumberLength) {
          throw new Error(
            "Номер команды должен состоять из " +
              expectedTeamNumberLength +
              " цифр. А у вас в номере команды количество символов равно " +
              number.length +
              "."
          );
        }
      } else {
        throw new Error(
          "Номер команды должен быть положительным целым числом. Вместо этого передано вот это значение: " +
            number
        );
      }
    }

    this.number = number;
    this.title = title;
  }

  /**
   * Возвращает true, если номер команды задан.
   */
  isTeamNumberPresent(): boolean {
    return this.number.length > 0;
  }

  /**
   * Возвращает true, если аргумент является числом либо может быть конвертирован в число.
   * @param value значение для проверки.
   * @returns true, если аргумент является числом либо может быть конвертирован в число.
   */
  private isNumber(value: string | number): boolean {
    return value != null && value !== "" && !isNaN(Number(value.toString()));
  }

  /**
   * Возвращает true, если аргумент (строка) является положительным целым числом больше нуля.
   * @param sourceString значение для проверки.
   * @returns true, если аргумент (строка) является положительным целым числом больше нуля.
   */
  private isPositiveInteger(sourceString: string): boolean {
    for (let character of sourceString) {
      if (!this.isNumber(character)) {
        return false;
      }
    }

    return true;
  }
}
