/**
 * Модель данных команды.
 */
export class Team {
  /**
   * Используется в случаях, когда нет информации о команде,
   * чтобы не создавать новых экземпляров класса.
   */
  public static emptyTeam: Team = new Team();

  /**
   * Идентификатор записи в базе данных.
   */
  id: number;

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
  constructor(number?: string, title?: string) {
    this.validateTeamNumber(number);

    this.number = number ? number : "";
    this.title = title ? title : "";
  }

  initialize(initialMap: Map<string, any>) {
    var numberValue = initialMap["number"];
    this.validateTeamNumber(numberValue);

    this.id = initialMap["id"];
    this.number = numberValue;
    this.title = initialMap["title"];
  }

  private validateTeamNumber(number: string) {
    /**
     * TODO Получать количество символов с сервера.
     */
    const expectedTeamNumberLength: number = 3;

    if (!number) {
      return;
    }

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
