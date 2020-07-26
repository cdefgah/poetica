import { QuestionDataModel } from '../data-model/QuestionDataModel';
import { AbstractViewModel } from './AbstractViewModel';

export class QuestionViewModelForTableRow extends AbstractViewModel {
  private readonly questionDataModel: QuestionDataModel;

  constructor(questionDataModel: QuestionDataModel) {
    super();
    this.questionDataModel = questionDataModel;
  }

  public get externalNumber(): string {
    return this.questionDataModel.externalNumber;
  }

  public get mainContent(): string {
    let mainContent = '';

    const trimmedTitle: string = this.questionDataModel.title ? this.questionDataModel.title.trim() : '';

    if (trimmedTitle.length > 0) {
      mainContent = trimmedTitle + '\n';
    }

    mainContent = mainContent + this.questionDataModel.body;

    return this.replaceNewLinesWithSurrogate(mainContent);
  }

  public get authorsAnswer(): string {
    if (this.questionDataModel.authorsAnswer) {
      return this.replaceNewLinesWithSurrogate(this.questionDataModel.authorsAnswer);
    } else {
      return '';
    }
  }

  get id(): number {
    return this.questionDataModel.id;
  }

  public get source(): string {
    return this.questionDataModel.source;
  }

  public get comment(): string {
    return this.questionDataModel.comment;
  }

  public get graded(): boolean {
    return this.questionDataModel.graded;
  }

  public get authorInfo(): string {
    return this.questionDataModel.authorInfo;
  }
}
