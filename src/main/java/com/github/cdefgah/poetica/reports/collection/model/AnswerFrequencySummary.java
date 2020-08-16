package com.github.cdefgah.poetica.reports.collection.model;

public final class AnswerFrequencySummary {
    private final boolean isAccepted;
    private final int count;

    public AnswerFrequencySummary(boolean isAccepted, int count) {
        this.isAccepted = isAccepted;
        this.count = count;
    }

    public boolean isAccepted() {
        return isAccepted;
    }

    public int getCount() {
        return count;
    }
}
