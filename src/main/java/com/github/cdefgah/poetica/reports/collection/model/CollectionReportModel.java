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

public final class CollectionReportModel extends AbstractReportModel {

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
        populateAnswersList();

        // проверяем корректность исходных данных
        buildConsistencyReport();

        if (this.isReportModelConsistent()) {
            // если в отчёте нет ошибок - считаем дальше
            buildMainReport();
        }
    }

    public boolean isReportModelConsistent() {
        return this.consistencyReportRows.isEmpty();
    }

    public List<ConsistencyReportRow> getConsistencyReportRows() {
        return Collections.unmodifiableList(consistencyReportRows);
    }

    private void populateAnswersList() {
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

    private void buildConsistencyReport() {
        if (this.allRecentAnswersList.isEmpty()) {
            return;
        }

        // сортируем список ответов по номеру и телу ответа (без комментария)
        this.allRecentAnswersList.sort(new QuestionNumberAndAnswerBodyComparator());

        Answer processingAnswer = this.allRecentAnswersList.get(0);
        ConsistencyReportRow consistencyReportRow = new ConsistencyReportRow(processingAnswer);
        consistencyReportRow.registerTeamFromAnswer(processingAnswer);

        for (int i=1; i<this.allRecentAnswersList.size(); i++) {
            processingAnswer = allRecentAnswersList.get(i);
            if (consistencyReportRow.itIsTimeToChangeRow(processingAnswer)) {
                // если данные внутри consistencyReportRow сигнализируют о проблеме - сохраняем её
                if (consistencyReportRow.isNotConsistent()) {
                    this.consistencyReportRows.add(consistencyReportRow);
                }

                consistencyReportRow = new ConsistencyReportRow(processingAnswer);
            }

            consistencyReportRow.registerTeamFromAnswer(processingAnswer);
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

        public ConsistencyReportRow(Answer answer) {
            this.questionNumber = answer.getQuestionNumber();
            this.answerBody = answer.getBody();
        }

        /**
         * Возвращает true, если пришло время создавать новый объект ConsistencyReportRow.
         * @param answer объект ответа.
         * @return true, если пришло время создавать новый объект ConsistencyReportRow.
         */
        public boolean itIsTimeToChangeRow(Answer answer) {
            return !(this.questionNumber == answer.getQuestionNumber() && this.answerBody.equals(answer.getBody()));
        }

        public void registerTeamFromAnswer(Answer answer) {
            final Team team = participatedTeamsMap.get(answer.getTeamId());
            assert team != null;

            if (answer.isAccepted()) {
                this.answerAcceptedFor.add(team);
            } else {
                this.answerDeclinedFor.add(team);
            }
        }

        public boolean isNotConsistent() {
            return !(this.answerAcceptedFor.isEmpty() || this.answerDeclinedFor.isEmpty());
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