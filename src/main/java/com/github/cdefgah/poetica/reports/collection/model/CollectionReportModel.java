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
    private final Map<QuestionNumberAndAnswerPair, ListOfAnswersFacade> consistencyMap = new HashMap<>();

    private final List<ConsistencyReportRecord> consistencyReportRecords = null;

    private final boolean reportModelIsConsistent;

    /**
     * Временная карта для расчёта тела отчёта.
     */
    private final Map<QuestionNumberAndAnswerPair, ListOfAnswersFacade> reportTemporaryMap = new TreeMap<>();

    /**
     * Содержит окончательную информацию по отчёту.
     */
    private final List<QuestionSummary> questionSummariesList = new ArrayList<>();

    public CollectionReportModel(EntityManager entityManager) {
        super(entityManager);

        participatedTeamsMap = getParticipatedTeams().stream().collect(Collectors.toMap(Team::getId, team -> team));
        populateAnswersListAndConsistencyMap();

        /*
        consistencyReportRecords = checkReportModelConsistency();
        reportModelIsConsistent = consistencyReportRecords.isEmpty();
        if (!reportModelIsConsistent) {
            // если в отчёте ошибки, нет смысла дальше что-то обсчитывать
            return;
        }
        */

        reportModelIsConsistent = true;

        // если в отчёте нет ошибок - считаем дальше
        buildMainReport();
    }

    public List<QuestionSummary> getQuestionSummariesList() {
        return Collections.unmodifiableList(questionSummariesList);
    }

    public boolean isReportModelIsConsistent() {
        return reportModelIsConsistent;
    }

    public List<ConsistencyReportRecord> getConsistencyReportRecords() {
        return Collections.unmodifiableList(consistencyReportRecords);
    }


    private void buildMainReport() {
        // группируем ответы по номерам заданий и тексту ответа с комментарием
        for (Answer answer : allRecentAnswersList) {
            final QuestionNumberAndAnswerPair questionNumberAndAnswerPair =
                    new QuestionNumberAndAnswerPair(answer.getQuestionNumber(), answer.getBodyWithComment());

            ListOfAnswersFacade listOfAnswersFacade = reportTemporaryMap.get(questionNumberAndAnswerPair);
            if (listOfAnswersFacade == null) {
                listOfAnswersFacade = new ListOfAnswersFacade();
                reportTemporaryMap.put(questionNumberAndAnswerPair, listOfAnswersFacade);
            }

            listOfAnswersFacade.addAnswer(answer);
        }

        // теперь строим окончательный отчёт
        int currentProcessingQuestionNumber = -1;
        QuestionSummary questionSummary = null;
        for (QuestionNumberAndAnswerPair questionNumberAndAnswerPair : reportTemporaryMap.keySet()) {
            if (questionNumberAndAnswerPair.getQuestionNumber() != currentProcessingQuestionNumber) {
                if (questionSummary != null) {
                    questionSummariesList.add(questionSummary);
                }

                currentProcessingQuestionNumber = questionNumberAndAnswerPair.getQuestionNumber();
                questionSummary = new QuestionSummary(currentProcessingQuestionNumber);
            }

            final ListOfAnswersFacade listOfAnswersFacade = reportTemporaryMap.get(questionNumberAndAnswerPair);
            final String answerBodyWithComment = questionNumberAndAnswerPair.getAnswer();
            final int frequency = listOfAnswersFacade.getAnswersCount();

            // все ответы в списке либо приняты, либо нет, поэтому достаточно взять этот признак от одного ответа
            final boolean isAccepted = listOfAnswersFacade.isAccepted();

            assert questionSummary != null;
            questionSummary.addAnswerFrequency(answerBodyWithComment, frequency, isAccepted);
        }

        // записываем последний questionSummary
        questionSummariesList.add(questionSummary);
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
                    final QuestionNumberAndAnswerPair questionNumberAndAnswerPair =
                                                      new QuestionNumberAndAnswerPair(questionNumber, answer.getBody());

                    ListOfAnswersFacade reportConsistencyMapValue = consistencyMap.get(questionNumberAndAnswerPair);
                    if (reportConsistencyMapValue == null) {
                        reportConsistencyMapValue = new ListOfAnswersFacade();
                        consistencyMap.put(questionNumberAndAnswerPair, reportConsistencyMapValue);
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
        final List<ConsistencyReportRecord> resultRowsList = new ArrayList<>();
        for (QuestionNumberAndAnswerPair questionNumberAndAnswerPair : consistencyMap.keySet()) {
            // проходим по всем элементам карты и проверяем корректность ответов для каждого ключа
            final ConsistencyReportRecord consistencyReportRecord =
                    new ConsistencyReportRecord(questionNumberAndAnswerPair.getQuestionNumber(),
                                                                               questionNumberAndAnswerPair.getAnswer());
            final List<Answer> answerList = consistencyMap.get(questionNumberAndAnswerPair).getListOfAnswers();
            for (Answer oneAnswer : answerList) {
                final Team team = participatedTeamsMap.get(oneAnswer.getTeamId());

                if (oneAnswer.isAccepted()) {
                    consistencyReportRecord.registerAcceptedAnswer(team);
                } else {
                    consistencyReportRecord.registerDeclinedAnswer(team);
                }
            }

            // обработали все ответы, теперь проверяем, они либо все должны быть либо зачтены либо отклонены
            // если это правило не соблюдается, мы фиксируем запись для дальнейшей обработки (выдаче в отчете)
            if (consistencyReportRecord.gradesAreInconsistent()) {
                resultRowsList.add(consistencyReportRecord);
            }
        }

        return resultRowsList;
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