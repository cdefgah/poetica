import { AnswerDataModel } from '../data-model/AnswerDataModel';
import { AbstractViewModel } from './AbstractViewModel';

export class AnswerViewModelForTableRow extends AbstractViewModel {

    private readonly answerDataModel: AnswerDataModel;

    constructor(answerDataModel: AnswerDataModel) {
        super();
        this.answerDataModel = answerDataModel;
    }


}