package com.github.cdefgah.poetica.reports.collection.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class QuestionSummary {
    private final int questionNumber;

    private final List<AnswerWithFrequency> acceptedAnswersSummary = new ArrayList<>();
    private final List<AnswerWithFrequency> declinedAnswersSummary = new ArrayList<>();

    public QuestionSummary(int questionNumber) {
        this.questionNumber = questionNumber;
    }

    public void addAnswerFrequency(String answerBodyWithComment, int frequency, boolean isAccepted) {
        if (isAccepted) {
            this.acceptedAnswersSummary.add(new AnswerWithFrequency(answerBodyWithComment, frequency));
        } else {
            this.declinedAnswersSummary.add(new AnswerWithFrequency(answerBodyWithComment, frequency));
        }
    }

    public int getQuestionNumber() {
        return questionNumber;
    }

    public List<AnswerWithFrequency> getAcceptedAnswersSummary() {
        return Collections.unmodifiableList(acceptedAnswersSummary);
    }

    public List<AnswerWithFrequency> getDeclinedAnswersSummary() {
        return Collections.unmodifiableList(declinedAnswersSummary);
    }

    public int getAcceptedCount() {
        return this.acceptedAnswersSummary.size();
    }

    public int getDeclinedCount() {
        return this.declinedAnswersSummary.size();
    }
}
