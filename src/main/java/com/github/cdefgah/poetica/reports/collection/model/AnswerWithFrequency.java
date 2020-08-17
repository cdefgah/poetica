package com.github.cdefgah.poetica.reports.collection.model;

public class AnswerWithFrequency {

    private final String answerBodyWithComment;
    private final int frequency;

    public AnswerWithFrequency(String answerBodyWithComment, int frequency) {
        this.answerBodyWithComment = answerBodyWithComment;
        this.frequency = frequency;
    }

    public String getAnswerBodyWithComment() {
        return answerBodyWithComment;
    }

    public int getFrequency() {
        return frequency;
    }

    @Override
    public String toString() {
        if (frequency > 1) {
            return this.answerBodyWithComment + " [" + this.frequency + "]";
        } else {
            return this.answerBodyWithComment;
        }
    }
}
