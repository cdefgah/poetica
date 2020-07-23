import { QuestionDataModel } from "../data-model/QuestionDataModel";
import { AbstractViewModel } from "./AbstractViewModel";

export class QuestionViewModelForTableRow extends AbstractViewModel {
  private _questionDataModel: QuestionDataModel;

  constructor(questionDataModel: QuestionDataModel) {
    super();
    this._questionDataModel = questionDataModel;
  }

  public get externalNumber(): string {
    return this._questionDataModel.externalNumber;
  }

  public get mainContentForTableRow(): string {
    var mainContent: string;
    var trimmedTitle: string = this._questionDataModel
      ? this._questionDataModel.title.trim()
      : "";
    if (trimmedTitle.length > 0) {
      mainContent = trimmedTitle + "\n";
    }

    mainContent = mainContent + this._questionDataModel.body;

    return this.compressNewLines(mainContent);
  }

  public get authorsAnswerForTableRow(): string {
    if (this._questionDataModel.authorsAnswer) {
      return this.compressNewLines(this._questionDataModel.authorsAnswer);
    } else {
      return "";
    }
  }

  public get source(): string {
    return this._questionDataModel.source;
  }

  public get comment(): string {
    return this._questionDataModel.comment;
  }
}
