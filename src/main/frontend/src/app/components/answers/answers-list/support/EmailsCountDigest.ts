export class EmailsCountDigest {
  public static readonly emptyDigest = new EmailsCountDigest(0, 0); // для инициализации в компонентах

  private _emailsQtyForTheFirstRound: number;
  private _emailsQtyForTheSecondRound: number;

  constructor(
    emailsQtyForTheFirstRound: number,
    emailsQtyForTheSecondRound: number
  ) {
    this._emailsQtyForTheFirstRound = emailsQtyForTheFirstRound;
    this._emailsQtyForTheSecondRound = emailsQtyForTheSecondRound;
  }

  get emailsQtyForTheFirstRound(): number {
    return this._emailsQtyForTheFirstRound;
  }

  get emailsQtyForTheSecondRound(): number {
    return this._emailsQtyForTheSecondRound;
  }
}
