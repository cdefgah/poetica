export class Question {
  id: number;
  number: number;
  body: string;
  source: string;
  comment: string;
  graded: boolean;

  constructor() {
    this.id = 0;
    this.number = 0;
    this.body = "";
    this.source = "";
    this.comment = "";
    this.graded = true;
  }

  initialize(initialMap: Map<string, any>) {
    this.id = initialMap["id"];
    this.number = initialMap["number"];
    this.body = initialMap["body"];
    this.comment = initialMap["comment"];
    this.source = initialMap["source"];
    this.graded = initialMap["graded"];
  }

  toString(): string {
    return `id:${this.id}\nnumber:${this.number}\ngraded:${this.graded}\nbody:${this.body}\nsource:${this.source}\ncomment:${this.comment}\n`;
  }
}
