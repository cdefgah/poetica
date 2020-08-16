package com.github.cdefgah.poetica.reports.collection.model;

import java.util.Objects;

public final class QuestionNumberAndAnswerPair implements Comparable<QuestionNumberAndAnswerPair> {

    private final int questionNumber;
    private final String answer;

    /**
     * Конструктор.
     * @param questionNumber номер вопроса.
     * @param answer в одних случаях передаётся только ответ (проверка корректности отчёта),
     *               в других (построение отчёта после проверки) - ответ, вместе с комментарием.
     */
    public QuestionNumberAndAnswerPair(int questionNumber, String answer) {
        this.questionNumber = questionNumber;
        this.answer = answer;
    }

    public int getQuestionNumber() {
        return questionNumber;
    }

    public String getAnswer() {
        return answer;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        QuestionNumberAndAnswerPair that = (QuestionNumberAndAnswerPair) o;
        return questionNumber == that.questionNumber &&
                answer.equals(that.answer);
    }

    @Override
    public int hashCode() {
        return Objects.hash(questionNumber, answer);
    }

    @Override
    public int compareTo(QuestionNumberAndAnswerPair anotherQuestionNumberAndAnswerPair) {
        if (this.questionNumber == anotherQuestionNumberAndAnswerPair.questionNumber) {
            return this.answer.compareTo(anotherQuestionNumberAndAnswerPair.answer);
        } else {
            return Integer.compare(this.questionNumber, anotherQuestionNumberAndAnswerPair.questionNumber);
        }
    }
}
