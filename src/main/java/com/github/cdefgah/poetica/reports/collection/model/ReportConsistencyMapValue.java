package com.github.cdefgah.poetica.reports.collection.model;

import com.github.cdefgah.poetica.model.Answer;

import java.util.ArrayList;
import java.util.List;

public class ReportConsistencyMapValue {
    private List<Answer> listOfAnswers = new ArrayList<>();

    public ReportConsistencyMapValue() {

    }

    public void addAnswer(Answer answer) {
        listOfAnswers.add(answer);
    }
}
