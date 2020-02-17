export class Question {
  id: number;
  number: number;
  body: string;
  source: string;
  comment: string;
  credited: boolean;

  constructor() {
    this.id = 0;
    this.number = 0;
    this.body = "";
    this.source = "";
    this.comment = "";
    this.credited = true;
  }

  initialize(initialMap: Map<string, any>) {
    this.id = initialMap["id"];
    this.number = initialMap["number"];
    this.body = initialMap["body"];
    this.comment = initialMap["comment"];
    this.source = initialMap["source"];
    this.credited = initialMap["credited"];
  }
}
