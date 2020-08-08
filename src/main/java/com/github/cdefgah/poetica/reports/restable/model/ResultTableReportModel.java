package com.github.cdefgah.poetica.reports.restable.model;

import com.github.cdefgah.poetica.model.Answer;
import com.github.cdefgah.poetica.model.Grade;
import com.github.cdefgah.poetica.model.Team;
import org.springframework.beans.factory.annotation.Autowired;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ResultTableReportModel {

    /**
     * Менеджер сущностей для взаимодействия с базой данных.
     */
    @Autowired
    EntityManager entityManager;

    /**
     * Строки для блока отчёта за предварительный тур.
     */
    private final List<ReportRowModel> preliminaryRoundBlockReportRows = new ArrayList<>();

    /**
     * Строки для блока отчёта за основной тур.
     */
    private final List<ReportRowModel> mainRoundBlockReportRows = new ArrayList<>();

    /**
     * Рейтинг вопросов за предварительный тур.
     */
    private final Map<Integer, Integer> preliminaryRoundQuestionsRatingMap = new HashMap<>();

    /**
     * Рейтинг вопросов за основной тур.
     */
    private final Map<Integer, Integer> mainRoundQuestionsRatingMap = new HashMap<>();

    private final int minQuestionNumber;

    private final int maxQuestionNumber;

    /**
     * Три прохода:
     * <p>
     * 1. Для каждого вопроса для каждой команды выполняем запрос, с целью получить
     * самый последний ответ для запрошенного раунда.
     * 2. Считаем рейтинг вопроса в туре.
     * 3. Считаем рейтинг каждой команды по сумме рейтингов взятых в туре вопросов.
     */

    public ResultTableReportModel() {
        minQuestionNumber = getMinQuestionNumber();
        maxQuestionNumber = getMaxQuestionNumber();

        initializeQuestionsRatingMaps(minQuestionNumber, maxQuestionNumber);

        final List<Team> teamsList = getAllTeams();

        // первый проход, проставляем отметки о взятых вопросах и обновляем рейтинг вопросов
        for (Team team : teamsList) {
            ReportRowModel preliminaryRoundBlockReportRow =
                                    new ReportRowModel(minQuestionNumber,
                                                            maxQuestionNumber, false,
                                                                                team, 0);
            preliminaryRoundBlockReportRows.add(preliminaryRoundBlockReportRow);

            final int amountOfAnswersTakenInPrevRound =
                                                preliminaryRoundBlockReportRow.getAmountOfTakenAnswersInThisRound();

            mainRoundBlockReportRows.add(new ReportRowModel(minQuestionNumber, maxQuestionNumber,
                                                               true, team, amountOfAnswersTakenInPrevRound));
        }

        // считаем рейтинг команд согласно итоговым рейтингам вопросов
        for (ReportRowModel reportRowModel: this.preliminaryRoundBlockReportRows) {
            reportRowModel.recalculateTeamRating();
        }

        for (ReportRowModel reportRowModel: this.mainRoundBlockReportRows) {
            reportRowModel.recalculateTeamRating();
        }
    }

    /**
     * Выполняет инициализацию таблиц с рейтингом вопросов.
     * @param minQuestionNumber минимальный номер вопроса в системе.
     * @param maxQuestionNumber максимальный номер вопроса в системе.
     */
    private void initializeQuestionsRatingMaps(int minQuestionNumber, int maxQuestionNumber) {
        for (int questionNumber = minQuestionNumber; questionNumber <= maxQuestionNumber; questionNumber++) {
            preliminaryRoundQuestionsRatingMap.put(questionNumber, 1);
            mainRoundQuestionsRatingMap.put(questionNumber, 1);
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

    // ===========================================================================================================
    public class ReportRowModel {

        private int teamNumber;

        private boolean[] answerFlags;

        private int amountOfTakenAnswersInThisRound;

        private int amountOfTakenAnswersInPreviousRound;

        private int teamRating;

        private String teamTitle;

        private boolean isMainRound;

        /**
         * Конструктор.
         * @param minQuestionNumber минимальный номер вопроса.
         * @param maxQuestionNumber максимальный номер вопроса.
         * @param isMainRound true, если блок отчёта относится к основному раунду.
         * @param team объект команды.
         * @param amountOfAnswersTakenInPreviousRound количество ответов, взятых в предыдущем раунде.
         */
        public ReportRowModel(int minQuestionNumber, int maxQuestionNumber, boolean isMainRound, Team team,
                                                                            int amountOfAnswersTakenInPreviousRound) {

            this.isMainRound = isMainRound;

            final int roundNumber = isMainRound ? 2 : 1;
            this.teamNumber = team.getNumber();
            this.teamTitle = team.getTitle();

            final int questionsAmount = maxQuestionNumber - minQuestionNumber + 1;
            answerFlags = new boolean[questionsAmount];

            int answerFlagIndex = 0;
            int takenAnswersAmount = 0;
            final Map<Integer, Integer> questionsRatingMap = isMainRound ? mainRoundQuestionsRatingMap :
                                                                                    preliminaryRoundQuestionsRatingMap;

            for(int questionNumber = minQuestionNumber; questionNumber <= maxQuestionNumber; questionNumber++) {
                answerFlags[answerFlagIndex] = isAnswerAccepted(questionNumber, team.getId(), roundNumber);

                if (answerFlags[answerFlagIndex]) {
                    // если вопрос взят, увеличиваем счётчик взятых вопросов
                    takenAnswersAmount++;
                } else {
                    // иначе - обновляем рейтинг вопроса
                    // если вопрос не взят, его рейтинг увеличивается на единицу
                    final int currentQuestionRating = questionsRatingMap.get(questionNumber);
                    questionsRatingMap.put(questionNumber, currentQuestionRating + 1);
                }

                answerFlagIndex++;
            }

            amountOfTakenAnswersInThisRound = takenAnswersAmount;
            amountOfTakenAnswersInPreviousRound = amountOfAnswersTakenInPreviousRound;
        }

        private boolean isAnswerAccepted(int questionNumber, long teamId, int roundNumber) {
            TypedQuery<Answer> query =
                    entityManager.createQuery("select answer from Answer answer " +
                                    "where answer.teamId=:teamId and answer.questionNumber=:questionNumber " +
                                    "and answer.roundNumber=:roundNumber and answer.grade:=grade " +
                                    "order by answer.emailSentOn desc",
                            Answer.class);
            query.setMaxResults(1); // нам нужна только одна запись

            query.setParameter("teamId", teamId);
            query.setParameter("questionNumber", questionNumber);
            query.setParameter("roundNumber", roundNumber);
            query.setParameter("grade", Grade.Accepted);

            return query.getSingleResult() != null;
        }

        public void recalculateTeamRating() {
            final Map<Integer, Integer> actualRatingMap = isMainRound ? mainRoundQuestionsRatingMap :
                                                                                    preliminaryRoundQuestionsRatingMap;
            teamRating = 0;
            int questionNumber = minQuestionNumber;
            for (int i = 0; i < answerFlags.length; i++) {
                if (answerFlags[i]) {
                    teamRating = teamRating + actualRatingMap.get(questionNumber);
                }
            }
        }

        public int getTeamNumber() {
            return teamNumber;
        }

        public boolean[] getAnswerFlags() {
            return answerFlags;
        }

        public int getAmountOfTakenAnswersInThisRound() {
            return amountOfTakenAnswersInThisRound;
        }

        public void setAmountOfTakenAnswersInThisRound(int amountOfTakenAnswersInThisRound) {
            this.amountOfTakenAnswersInThisRound = amountOfTakenAnswersInThisRound;
        }

        public int getAmountOfTakenAnswersInPreviousRound() {
            return amountOfTakenAnswersInPreviousRound;
        }

        public void setAmountOfTakenAnswersInPreviousRound(int amountOfTakenAnswersInPreviousRound) {
            this.amountOfTakenAnswersInPreviousRound = amountOfTakenAnswersInPreviousRound;
        }

        public int getTeamRating() {
            return teamRating;
        }

        public void setTeamRating(int teamRating) {
            this.teamRating = teamRating;
        }

        public String getTeamTitle() {
            return teamTitle;
        }
    }
}



