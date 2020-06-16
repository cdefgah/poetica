export abstract class AbstractBareComponent {
  /**
   * Читает значения из словаря, если ключа нет, возвращает пустую строку.
   * @param mapKey ключ для чтени из словаря.
   * @param map словарь.
   * @return значение из словаря по ключу, либо, если такой ключ в словаре отсутствует, пустую строку.
   */
  protected getMapValue(mapKey: string, map: Map<string, string>): string {
    if (mapKey in map && map[mapKey]) {
      return map[mapKey];
    } else {
      return "";
    }
  }
}
