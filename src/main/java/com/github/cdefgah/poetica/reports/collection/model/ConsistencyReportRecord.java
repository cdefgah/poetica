package com.github.cdefgah.poetica.reports.collection.model;

import com.github.cdefgah.poetica.model.Team;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class ConsistencyReportRecord {

    private final int questionNumber;
    private final String answerBody;

    private final List<Team> answerAcceptedFor = new ArrayList<>();
    private final List<Team> answerDeclinedFor = new ArrayList<>();

    public ConsistencyReportRecord(int questionNumber, String answerBody) {
        this.questionNumber = questionNumber;
        this.answerBody = answerBody;
    }

    public void registerAcceptedAnswer(Team team) {
        this.answerAcceptedFor.add(team);
    }

    public void registerDeclinedAnswer(Team team) {
        this.answerDeclinedFor.add(team);
    }

    public List<Team> getAnswerAcceptedFor() {
        return Collections.unmodifiableList(answerAcceptedFor);
    }

    public List<Team> getAnswerDeclinedFor() {
        return Collections.unmodifiableList(answerDeclinedFor);
    }

    public int getQuestionNumber() {
        return questionNumber;
    }

    public String getAnswerBody() {
        return answerBody;
    }
}
