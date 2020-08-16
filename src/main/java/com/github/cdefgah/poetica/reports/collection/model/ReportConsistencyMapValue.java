package com.github.cdefgah.poetica.reports.collection.model;

import com.github.cdefgah.poetica.model.Answer;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

final class ReportConsistencyMapValue {
    private final List<Answer> listOfAnswers = new ArrayList<>();

    public ReportConsistencyMapValue() {

    }

    public void addAnswer(Answer answer) {
        listOfAnswers.add(answer);
    }

    public List<Answer> getListOfAnswers() {
        return Collections.unmodifiableList(listOfAnswers);
    }
}
