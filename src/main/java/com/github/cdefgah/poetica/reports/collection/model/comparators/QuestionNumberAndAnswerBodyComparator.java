package com.github.cdefgah.poetica.reports.collection.model.comparators;

import com.github.cdefgah.poetica.model.Answer;

import java.util.Comparator;

public class QuestionNumberAndAnswerBodyComparator implements Comparator<Answer> {
    @Override
    public int compare(Answer firstAnswer, Answer secondAnswer) {
        if (firstAnswer.getQuestionNumber() == secondAnswer.getQuestionNumber()) {
            return firstAnswer.getBody().compareTo(secondAnswer.getBody());
        } else {
            return Integer.compare(firstAnswer.getQuestionNumber(), secondAnswer.getQuestionNumber());
        }
    }
}
