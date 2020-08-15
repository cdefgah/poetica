package com.github.cdefgah.poetica.reports.collection.model;

import com.github.cdefgah.poetica.model.Answer;
import com.github.cdefgah.poetica.model.Grade;
import com.github.cdefgah.poetica.model.Team;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.util.*;

public class CollectionReportModel {

    private final EntityManager entityManager;

    /**
     * Хранит объекты с номером и телом ответа (с комментарием) и сопоставленным ему количеством.
     */
    private final Map<AnswerNumberAndBody, Integer> frequencyMap = new TreeMap<>();

    public CollectionReportModel(EntityManager entityManager) {
        this.entityManager = entityManager;
        final int minQuestionNumber = calculateMinQuestionNumber();
        final int maxQuestionNumber = calculateMaxQuestionNumber();

        List<Team> teams = getParticipatedTeams();
        for (Team team : teams) {
            for (int questionNumber = minQuestionNumber; questionNumber <= maxQuestionNumber; questionNumber++) {

                final Answer foundAnswer = getTeamsAnswerWithComment(team.getId(), questionNumber);
                if (foundAnswer == null) {
                    continue;
                }

                final AnswerNumberAndBody answerNumberAndBody = new AnswerNumberAndBody(foundAnswer);
                if (frequencyMap.containsKey(answerNumberAndBody)) {
                    // если в карте уже есть такой ответ
                    // увеличиваем частоту появления ответа на конкретный вопрос
                    final int currentFrequency = frequencyMap.get(answerNumberAndBody);
                    frequencyMap.put(answerNumberAndBody, currentFrequency + 1);
                } else {
                    // помещаем в таблицу новый ответ, которого там ещё не было
                    frequencyMap.put(answerNumberAndBody, 1);
                }
            }
        }
    }

    public Map<AnswerNumberAndBody, Integer> getFrequencyMap() {
        return Collections.unmodifiableMap(this.frequencyMap);
    }

    // TODO потом объединить отчёты в иерархию и вынести общие методы в их предка
    private List<Team> getParticipatedTeams() {
        TypedQuery<Team> query = entityManager.createQuery("select distinct team from Team team, " +
                "Email email where team.id=email.teamId", Team.class);
        return query.getResultList();
    }

    private int calculateMaxQuestionNumber() {
        TypedQuery<Integer> query = entityManager.createQuery("select max(question.lowestInternalNumber) " +
                        "FROM Question question",
                Integer.class);
        final Integer resultValue = query.getSingleResult();
        return resultValue != null ? resultValue : 0;
    }

    private int calculateMinQuestionNumber() {
        TypedQuery<Integer> query = entityManager.createQuery("select min(question.lowestInternalNumber) " +
                        "FROM Question question",
                Integer.class);
        final Integer resultValue = query.getSingleResult();
        return resultValue != null ? resultValue : 0;
    }

    /**
     * Ищет самый поздний ответ команды на вопрос.
     * @param teamId уникальный идентификатор команды.
     * @param questionNumber номер вопроса (задания).
     * @return найденный ответ.
     */
    private Answer getTeamsAnswerWithComment(long teamId, int questionNumber) {
        TypedQuery<Answer> query =
                entityManager.createQuery("select answer from Answer answer where" +
                        " answer.teamId=:teamId and" +
                        " answer.questionNumber=:questionNumber" +
                        " order by answer.emailSentOn desc", Answer.class);

        query.setParameter("teamId", teamId);
        query.setParameter("questionNumber", questionNumber);
        List<Answer> foundAnswers = query.getResultList();
        if (foundAnswers.size() > 0) {
            return foundAnswers.get(0);
        } else {
            return null;
        }
    }

    // ======================================================================================
    public static final class AnswerNumberAndBody implements Comparable<AnswerNumberAndBody> {
        private final int questionNumber;
        private final String answerBody;
        private final boolean isAccepted;

        public AnswerNumberAndBody(Answer answer) {
            this.questionNumber = answer.getQuestionNumber();
            this.answerBody = answer.getAnswerWithComment();
            this.isAccepted = answer.isAccepted();
        }

        public int getQuestionNumber() {
            return questionNumber;
        }

        public String getAnswerBody() {
            return answerBody;
        }

        public boolean isAccepted() {
            return isAccepted;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            AnswerNumberAndBody that = (AnswerNumberAndBody) o;
            return questionNumber == that.questionNumber &&
                    isAccepted == that.isAccepted &&
                    answerBody.equals(that.answerBody);
        }

        @Override
        public int hashCode() {
            return Objects.hash(questionNumber, answerBody, isAccepted);
        }

        @Override
        public int compareTo(AnswerNumberAndBody anotherAnswerNumberAndBody) {
            // сперва сортируем по номеру вопроса
            if (this.getQuestionNumber() == anotherAnswerNumberAndBody.getQuestionNumber()) {
                // потом по признаку "Засчитано/Не засчитано"
                if (this.isAccepted() == anotherAnswerNumberAndBody.isAccepted()) {
                    // а потом само тело ответа в алфавитном порядке
                    return this.getAnswerBody().compareTo(anotherAnswerNumberAndBody.getAnswerBody());
                } else {
                    // если один ответ засчитан, а другой нет, то большим является тот, который засчитан
                    if (this.isAccepted() && !anotherAnswerNumberAndBody.isAccepted()) {
                        return 1;
                    } else {
                        // если этот ответ не засчитан, а другой засчитан, то другой ответ больше в порядке сортировки
                        // тут выполняется: !this.isAccepted() && anotherAnswerNumberAndBody.isAccepted()
                        return -1;
                    }
                }
            } else {
                // если номера вопросов разные - то определяем, который пустить первым, который - вторым
                return Integer.compare(this.questionNumber, anotherAnswerNumberAndBody.questionNumber);
            }
        }
    }
}