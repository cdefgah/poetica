/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

import { AnswerDataModel } from '../data-model/AnswerDataModel';
import { AbstractViewModel } from './AbstractViewModel';

export class AnswerViewModelForTableRow extends AbstractViewModel {

    private readonly answerDataModel: AnswerDataModel;

    constructor(answerDataModel: AnswerDataModel) {
        super();
        this.answerDataModel = answerDataModel;
    }


}