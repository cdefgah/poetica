package com.github.cdefgah.poetica.reports.collection.model;

import com.github.cdefgah.poetica.model.Answer;
import com.github.cdefgah.poetica.model.Team;
import com.github.cdefgah.poetica.reports.AbstractReportModel;

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

    // карта для проверки корректности оценок.
    // чтобы один и тот-же ответ (до буквы) на одно и то-же задание был либо принят либо отклонён для всех команд
    private final Map<ReportConsistencyMapKey, ReportConsistencyMapValue> consistencyMap = new HashMap<>();

    private final List<ConsistencyReportRecord> consistencyReportRecords;

    private final boolean reportModelIsConsistent;

    public CollectionReportModel(EntityManager entityManager) {
        super(entityManager);

        participatedTeamsMap = getParticipatedTeams().stream().collect(Collectors.toMap(Team::getId, team -> team));
        populateAnswersListAndConsistencyMap();

        consistencyReportRecords = checkReportModelConsistency();
        reportModelIsConsistent = consistencyReportRecords.isEmpty();
        if (!reportModelIsConsistent) {
            return;
        }

    }

    public boolean isReportModelIsConsistent() {
        return reportModelIsConsistent;
    }

    public List<ConsistencyReportRecord> getConsistencyReportRecords() {
        return Collections.unmodifiableList(consistencyReportRecords);
    }

    private void populateAnswersListAndConsistencyMap() {
        for (int questionNumber = this.getMinQuestionNumber();
             questionNumber <= this.getMaxQuestionNumber(); questionNumber++) {

            for (Team team : participatedTeamsMap.values()) {
                final Answer answer = getMostRecentAnswer(team.getId(), questionNumber);
                if (answer != null) {
                    // добавляем ответ в общий список ответов
                    allRecentAnswersList.add(answer);

                    // добавляем ответ в consistencyMap
                    final ReportConsistencyMapKey reportConsistencyMapKey =
                                                      new ReportConsistencyMapKey(questionNumber, answer.getBody());

                    ReportConsistencyMapValue reportConsistencyMapValue = consistencyMap.get(reportConsistencyMapKey);
                    if (reportConsistencyMapValue == null) {
                        reportConsistencyMapValue = new ReportConsistencyMapValue();
                    }

                    reportConsistencyMapValue.addAnswer(answer);
                }
            }
        }
    }

    /**
     * Проверяет корректность исходных данных для отчёта.
     * @return список с записями о несоответствиях. Если несоответствий нет - пустой список.
     */
    private List<ConsistencyReportRecord> checkReportModelConsistency() {
        return Collections.EMPTY_LIST;
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
}