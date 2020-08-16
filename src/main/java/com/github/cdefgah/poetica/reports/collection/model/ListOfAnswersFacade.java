package com.github.cdefgah.poetica.reports.collection.model;

import com.github.cdefgah.poetica.model.Answer;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class ListOfAnswersFacade {
    private final List<Answer> listOfAnswers = new ArrayList<>();

    public ListOfAnswersFacade() {

    }

    public void addAnswer(Answer answer) {
        listOfAnswers.add(answer);
    }

    public List<Answer> getListOfAnswers() {
        return Collections.unmodifiableList(listOfAnswers);
    }

    /**
     * Используется только в случае корректного отчёта. Все ответы либо приняты либо нет.
     * @return true, если ответы приняты.
     */
    public boolean isAccepted() {
        return listOfAnswers.get(0).isAccepted();
    }

    public int getAnswersCount() {
        return this.listOfAnswers.size();
    }
}
