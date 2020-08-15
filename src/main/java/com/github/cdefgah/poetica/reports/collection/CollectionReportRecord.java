package com.github.cdefgah.poetica.reports.collection;

public class CollectionReportRecord {

    private final int questionNumber;
    private final String answerBody;
    private final long totalCount;

    public CollectionReportRecord(int questionNumber, String answerBody, long totalCount) {
        this.questionNumber = questionNumber;
        this.answerBody = answerBody;
        this.totalCount = totalCount;
    }

    public int getQuestionNumber() {
        return questionNumber;
    }

    public String getAnswerBody() {
        return answerBody;
    }

    public long getTotalCount() {
        return totalCount;
    }

    @Override
    public String toString() {
        return "CollectionReportRecord{" +
                "questionNumber=" + questionNumber +
                ", answerBody='" + answerBody + '\'' +
                ", totalCount=" + totalCount +
                '}';
    }
}
