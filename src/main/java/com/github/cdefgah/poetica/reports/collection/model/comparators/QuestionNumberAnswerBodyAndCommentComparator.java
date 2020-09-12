/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.reports.collection.model.comparators;

import com.github.cdefgah.poetica.model.Answer;

import java.util.Comparator;

public class QuestionNumberAnswerBodyAndCommentComparator implements Comparator<Answer> {
    @Override
    public int compare(Answer firstAnswer, Answer secondAnswer) {
        if (firstAnswer.getQuestionNumber() == secondAnswer.getQuestionNumber()) {
            return firstAnswer.getBodyWithComment().compareTo(secondAnswer.getBodyWithComment());
        } else {
            return Integer.compare(firstAnswer.getQuestionNumber(), secondAnswer.getQuestionNumber());
        }
    }
}
