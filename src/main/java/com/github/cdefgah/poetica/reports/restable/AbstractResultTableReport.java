package com.github.cdefgah.poetica.reports.restable;

import com.github.cdefgah.poetica.model.Team;
import org.springframework.beans.factory.annotation.Autowired;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

abstract class AbstractResultTableReport {

    /**
     * Менеджер сущностей для взаимодействия с базой данных.
     */
    @Autowired
    EntityManager entityManager;

    /**
     * Строки для блока отчёта за предварительный тур.
     */
    private final List<ResultTableReportRow> preliminaryRoundBlockReportRows = new ArrayList<>();

    /**
     * Строки для блока отчёта за основной тур.
     */
    private final List<ResultTableReportRow> mainRoundBlockReportRows = new ArrayList<>();

    private final Map<Integer, Integer> allQuestionsRatingMap = new HashMap<>();

    /**
     * Три прохода:
     * <p>
     * 1. Для каждого вопроса для каждой команды выполняем запрос, с целью получить
     * самый последний ответ для запрошенного раунда.
     * 2. Считаем рейтинг вопроса в туре.
     * 3. Считаем рейтинг каждой команды по сумме рейтингов взятых в туре вопросов.
     */

    public AbstractResultTableReport() {

    }

    public void buildReport() {
        // на тот случай, если кто-то решит вызвать
        // этот метод более одного раза очищаем списки строк для отчёта
        preliminaryRoundBlockReportRows.clear();
        mainRoundBlockReportRows.clear();

        final int minQuestionNumber = getMinQuestionNumber();
        final int maxQuestionNumber = getMaxQuestionNumber();

        final List<Team> teamsList = getAllTeams();

        // первый проход, проставляем отметки о принятых ответах для всех команд
        for (Team team : teamsList) {
            ResultTableReportRow preliminaryRoundBlockReportRow =
                    new ResultTableReportRow(minQuestionNumber,
                            maxQuestionNumber, false,
                            team, 0);

            preliminaryRoundBlockReportRows.add(preliminaryRoundBlockReportRow);

            final int amountOfAnswersTakenInPrevRound =
                    preliminaryRoundBlockReportRow.getAnsweredQuestionsDigest().getAmountOfTakenAnswersInThisRound();

            mainRoundBlockReportRows.add(new ResultTableReportRow(minQuestionNumber, maxQuestionNumber,
                                                                true, team, amountOfAnswersTakenInPrevRound));
        }

        // второй проход рассчитываем рейтинг вопросов на основании информации о принятых ответах на них
        initializeQuestionsRatingMap(minQuestionNumber, maxQuestionNumber);

    }

    private void initializeQuestionsRatingMap(int minQuestionNumber, int maxQuestionNumber) {
        for (int questionNumber = minQuestionNumber; questionNumber <= maxQuestionNumber; questionNumber++) {
            allQuestionsRatingMap.put(questionNumber, 1);
        }
    }

    private List<Team> getAllTeams() {
        TypedQuery<Team> query = entityManager.createQuery("select team from Team team", Team.class);
        return query.getResultList();
    }

    private int getMaxQuestionNumber() {
        TypedQuery<Integer> query = entityManager.createQuery("select max(question.lowestInternalNumber) " +
                        "FROM Question question",
                Integer.class);
        final Integer resultValue = query.getSingleResult();
        return resultValue != null ? resultValue : 0;
    }

    private int getMinQuestionNumber() {
        TypedQuery<Integer> query = entityManager.createQuery("select min(question.lowestInternalNumber) " +
                        "FROM Question question",
                Integer.class);
        final Integer resultValue = query.getSingleResult();
        return resultValue != null ? resultValue : 0;
    }

    public abstract String getFileNamePart();

    public abstract String getReportText();

    protected String getBlockTitle(boolean isTheMainRound) {
        return "ЗАЧЁТ  " + (isTheMainRound ? "Основной" : "Предварительный");
    }
}



