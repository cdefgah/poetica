package com.github.cdefgah.poetica.reports.collection.model;

import java.util.Objects;

final class ReportConsistencyMapKey {

    private final int questionNumber;
    private final String answerBody;

    public ReportConsistencyMapKey(int questionNumber, String answerBody) {
        this.questionNumber = questionNumber;
        this.answerBody = answerBody;
    }

    public int getQuestionNumber() {
        return questionNumber;
    }

    public String getAnswerBody() {
        return answerBody;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ReportConsistencyMapKey that = (ReportConsistencyMapKey) o;
        return questionNumber == that.questionNumber &&
                answerBody.equals(that.answerBody);
    }

    @Override
    public int hashCode() {
        return Objects.hash(questionNumber, answerBody);
    }
}
