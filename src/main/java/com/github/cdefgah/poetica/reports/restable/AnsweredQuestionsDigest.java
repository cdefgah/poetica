package com.github.cdefgah.poetica.reports.restable;

class AnsweredQuestionsDigest {
    private int amountOfTakenAnswersInThisRound;
    private int amountOfTakenAnswersInPreviousRound;

    public AnsweredQuestionsDigest() {

    }

    public int getAmountOfTakenAnswersInThisRound() {
        return amountOfTakenAnswersInThisRound;
    }

    public void setAmountOfTakenAnswersInThisRound(int amountOfTakenAnswersInThisRound) {
        this.amountOfTakenAnswersInThisRound = amountOfTakenAnswersInThisRound;
    }

    public int getAmountOfTakenAnswersInPreviousRound() {
        return amountOfTakenAnswersInPreviousRound;
    }

    public void setAmountOfTakenAnswersInPreviousRound(int amountOfTakenAnswersInPreviousRound) {
        this.amountOfTakenAnswersInPreviousRound = amountOfTakenAnswersInPreviousRound;
    }
}
