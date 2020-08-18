package com.github.cdefgah.poetica.reports.collection.model;

import com.github.cdefgah.poetica.model.Answer;
import com.github.cdefgah.poetica.model.Team;
import com.github.cdefgah.poetica.reports.AbstractReportModel;
import com.github.cdefgah.poetica.reports.collection.model.comparators.QuestionNumberAndAnswerBodyComparator;
import com.github.cdefgah.poetica.reports.collection.model.comparators.QuestionNumberAnswerBodyAndCommentComparator;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.util.*;
import java.util.stream.Collectors;

public class CollectionReportModel extends AbstractReportModel {

    /**
     * Чтобы избежать ненужных обращений в базу, когда надо получить объект команды по id.
     * Количество команд небольшое (несколько десятков), так что этот способ не создаст проблем.
     */
    protected final Map<Long, Team> participatedTeamsMap;

    protected final List<Answer> allRecentAnswersList = new ArrayList<>();

    private final List<ConsistencyReportRow> consistencyReportRows = new ArrayList<>();

    public CollectionReportModel(EntityManager entityManager) {
        super(entityManager);

        participatedTeamsMap = getParticipatedTeams().stream().collect(Collectors.toMap(Team::getId, team -> team));
        populateAnswersListAndConsistencyMap();

        // если в отчёте нет ошибок - считаем дальше
        buildMainReport();
    }

    public boolean isReportModelConsistent() {
        return this.consistencyReportRows.isEmpty();
    }

    public List<ConsistencyReportRow> getConsistencyReportRows() {
        return Collections.unmodifiableList(consistencyReportRows);
    }

    private void populateAnswersListAndConsistencyMap() {
        for (int questionNumber = this.minQuestionNumber; questionNumber <= this.maxQuestionNumber; questionNumber++) {
            for (Team team : participatedTeamsMap.values()) {
                final Answer answer = getMostRecentAnswer(team.getId(), questionNumber);
                if (answer != null) {
                    // добавляем ответ в общий список ответов
                    allRecentAnswersList.add(answer);
                }
            }
        }
    }

    /**
     * Ищет самый поздний ответ команды на вопрос.
     * @param teamId уникальный идентификатор команды.
     * @param questionNumber номер вопроса (задания).
     * @return найденный ответ.
     */
    private Answer getMostRecentAnswer(long teamId, int questionNumber) {
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

    private void buildMainReport() {
        // сортируем список ответов по номеру и телу ответа вместе с комментарием
        this.allRecentAnswersList.sort(new QuestionNumberAnswerBodyAndCommentComparator());

    }

    private void buildConsistentReport() {
        // сортируем список ответов по номеру и телу ответа (без комментария)
        this.allRecentAnswersList.sort(new QuestionNumberAndAnswerBodyComparator());

        int currentQuestionNumber = -1;
        String currentAnswerBody = "";
        boolean currentGroupAcceptedFlag = false;
        for (int i=0; i<this.allRecentAnswersList.size(); i++) {
            final Answer processingAnswer = allRecentAnswersList.get(i);
            if (currentQuestionNumber == -1) {
                currentQuestionNumber = processingAnswer.getQuestionNumber();
                currentAnswerBody = processingAnswer.getBody();
                currentGroupAcceptedFlag = processingAnswer.isAccepted();
            }

        }
    }

    // ==========================================================================================================

    /**
     * Содержит блок информации о рассогласовании в оценках одного и того-же ответа.
     */
    public class ConsistencyReportRow {
        private final int questionNumber;
        private final String answerBody;

        private final List<Team> answerAcceptedFor = new ArrayList<>();
        private final List<Team> answerDeclinedFor = new ArrayList<>();;

        public ConsistencyReportRow(int questionNumber, String answerBody) {
            this.questionNumber = questionNumber;
            this.answerBody = answerBody;
        }

        public void registerTeam(long teamId, boolean isAnswerAccepted) {
            final Team team = participatedTeamsMap.get(teamId);
            assert team != null;

            if (isAnswerAccepted) {
                this.answerAcceptedFor.add(team);
            } else {
                this.answerDeclinedFor.add(team);
            }
        }

        public int getQuestionNumber() {
            return questionNumber;
        }

        public String getAnswerBody() {
            return answerBody;
        }

        public List<Team> getAnswerAcceptedFor() {
            return Collections.unmodifiableList(answerAcceptedFor);
        }

        public List<Team> getAnswerDeclinedFor() {
            return Collections.unmodifiableList(answerDeclinedFor);
        }
    }
}