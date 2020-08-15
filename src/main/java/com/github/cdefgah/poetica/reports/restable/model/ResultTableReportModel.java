package com.github.cdefgah.poetica.reports.restable.model;

import com.github.cdefgah.poetica.model.Answer;
import com.github.cdefgah.poetica.model.Grade;
import com.github.cdefgah.poetica.model.Question;
import com.github.cdefgah.poetica.model.Team;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.util.*;

public class ResultTableReportModel {

    /**
     * Менеджер сущностей для взаимодействия с базой данных.
     */
    private final EntityManager entityManager;

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
     * Номер вопроса - зачётный или внезачётный вопрос.
     */
    private final Map<Integer, Boolean> allQuestionGradesMap = new HashMap<>();

    /**
     * Рейтинг вопросов за основной тур.
     */
    private final Map<Integer, Integer> mainRoundQuestionsRatingMap = new HashMap<>();

    private final int minQuestionNumber;

    private final int maxQuestionNumber;

    public ResultTableReportModel(EntityManager entityManager) {
        this.entityManager = entityManager;

        minQuestionNumber = calculateMinQuestionNumber();
        maxQuestionNumber = calculateMaxQuestionNumber();

        initializeQuestionsRatingMaps(minQuestionNumber, maxQuestionNumber);
        initQuestionsGradesMap();

        final List<Team> teamsList = getParticipatedTeams();

        // первый проход, проставляем отметки о взятых вопросах и обновляем рейтинг вопросов
        for (Team team : teamsList) {

            // TODO - передавать null в параметрах нехорошо, переделать
            ReportRowModel preliminaryRoundBlockReportRow =
                    new ReportRowModel(minQuestionNumber,
                            maxQuestionNumber, team, null);
            preliminaryRoundBlockReportRows.add(preliminaryRoundBlockReportRow);

            mainRoundBlockReportRows.add(new ReportRowModel(minQuestionNumber, maxQuestionNumber,
                    team, preliminaryRoundBlockReportRow));
        }

        // считаем рейтинг команд согласно итоговым рейтингам вопросов
        for (ReportRowModel reportRowModel : this.preliminaryRoundBlockReportRows) {
            reportRowModel.recalculateTeamRating();
        }

        for (ReportRowModel reportRowModel : this.mainRoundBlockReportRows) {
            reportRowModel.recalculateTeamRating();
        }

        Collections.sort(preliminaryRoundBlockReportRows);
        Collections.sort(mainRoundBlockReportRows);
    }

    public EntityManager getEntityManager() {
        return entityManager;
    }


    public int getMinQuestionNumber() {
        return minQuestionNumber;
    }

    public int getMaxQuestionNumber() {
        return maxQuestionNumber;
    }

    public Collection<ReportRowModel> getPreliminaryRoundBlockReportRows() {
        return Collections.unmodifiableCollection(preliminaryRoundBlockReportRows);
    }

    public Collection<ReportRowModel> getMainRoundBlockReportRows() {
        return Collections.unmodifiableCollection(mainRoundBlockReportRows);
    }

    private  void initQuestionsGradesMap() {
        final TypedQuery<Question> query = entityManager.createQuery("select question from Question question",
                                                                                                        Question.class);
        final List<Question> allQuestions = query.getResultList();
        for (Question question: allQuestions) {
            if (question.isSingleNumberQuestion()) {
                // если у задания один номер, ставим в соответствие этому номеру признак "зачётный/внезачётный"
                allQuestionGradesMap.put(question.getLowestInternalNumber(), question.isGraded());
            } else {
                // если нет - то заполняем карту номерами для быстрой проверки при формировании отчёта
                // строго говоря можно было бы оставить только этот цикл, без проверки на isSingleNumberQuestion
                // но код бы стал менее читабельным.
                for (int i = question.getLowestInternalNumber(); i <= question.getHighestInternalNumber(); i++) {
                    allQuestionGradesMap.put(i, question.isGraded());
                }
            }
        }
    }

    /**
     * Выполняет инициализацию таблиц с рейтингом вопросов.
     *
     * @param minQuestionNumber минимальный номер вопроса в системе.
     * @param maxQuestionNumber максимальный номер вопроса в системе.
     */
    private void initializeQuestionsRatingMaps(int minQuestionNumber, int maxQuestionNumber) {
        for (int questionNumber = minQuestionNumber; questionNumber <= maxQuestionNumber; questionNumber++) {
            preliminaryRoundQuestionsRatingMap.put(questionNumber, 1);
            mainRoundQuestionsRatingMap.put(questionNumber, 1);
        }
    }

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

    public Map<Integer, Integer> getQuestionsRatingMap(boolean isMainRound) {
        return Collections.unmodifiableMap(isMainRound ?
                this.mainRoundQuestionsRatingMap : this.preliminaryRoundQuestionsRatingMap);
    }

    public Map<Integer, Boolean> getAllQuestionGradesMap() {
        return Collections.unmodifiableMap(allQuestionGradesMap);
    }

    // ===========================================================================================================
    public class ReportRowModel implements Comparable<ReportRowModel> {

        private final int teamNumber;

        private final boolean[] answerFlags;

        private final int amountOfTakenAnswersInThisRound;

        private int amountOfTakenAnswersInPreviousRound;

        private int teamRating;

        private final String teamTitle;

        private final boolean isMainRound;

        /**
         * Конструктор.
         *
         * @param minQuestionNumber     минимальный номер вопроса.
         * @param maxQuestionNumber     максимальный номер вопроса.
         * @param team                  объект команды.
         * @param previousRoundRowModel строка отчёта для этой команды, но из предыдущего раунда.
         */
        ReportRowModel(int minQuestionNumber, int maxQuestionNumber, Team team, ReportRowModel previousRoundRowModel) {

            this.isMainRound = previousRoundRowModel != null;

            final int roundNumber = isMainRound ? 2 : 1;
            this.teamNumber = team.getNumber();
            this.teamTitle = team.getTitle();

            final int questionsAmount = maxQuestionNumber - minQuestionNumber + 1;
            answerFlags = new boolean[questionsAmount];

            int answerFlagIndex = 0;
            int takenAnswersAmount = 0;
            final Map<Integer, Integer> questionsRatingMap = isMainRound ? mainRoundQuestionsRatingMap :
                    preliminaryRoundQuestionsRatingMap;

            for (int questionNumber = minQuestionNumber; questionNumber <= maxQuestionNumber; questionNumber++) {
                final boolean isAnswerAccepted = isAnswerAccepted(questionNumber, team.getId(), roundNumber);
                answerFlags[answerFlagIndex] = isAnswerAccepted;

                if (isAnswerAccepted) {
                    // если вопрос взят, увеличиваем счётчик взятых вопросов
                    // но только, если вопрос был зачётным
                    if (allQuestionGradesMap.get(questionNumber)) {
                        takenAnswersAmount++;
                    }
                } else {
                    // иначе - если это основной раунд, проверяем, взят-ли этот вопрос в предыдущем раунде
                    // если взят, учитываем его. Иначе - обновляем рейтинг вопроса.
                    boolean questionIsNotAnswered = true;

                    if (previousRoundRowModel != null) {
                        final boolean[] preliminaryRoundAnswerFlags = previousRoundRowModel.getAnswerFlags();
                        if (preliminaryRoundAnswerFlags[answerFlagIndex]) {
                            // вопрос был взят в предыдущем раунде

                            // увеличиваем счётчик взятых вопросов, несмотря на то, что вопрос взят в предыдущем раунде
                            if (allQuestionGradesMap.get(questionNumber)) {
                                // но только для зачётных заданий
                                takenAnswersAmount++;
                            }

                            // помечаем его как взятый в этом раунде тоже
                            answerFlags[answerFlagIndex] = true;

                            // ставим отметку, что вопрос взят
                            questionIsNotAnswered = false;
                        }
                    }

                    if (questionIsNotAnswered) {
                        // иначе - обновляем рейтинг вопроса
                        // если вопрос не взят, его рейтинг увеличивается на единицу
                        final int currentQuestionRating = questionsRatingMap.get(questionNumber);
                        questionsRatingMap.put(questionNumber, currentQuestionRating + 1);
                    }
                }

                answerFlagIndex++;
            }

            amountOfTakenAnswersInThisRound = takenAnswersAmount;
            if (previousRoundRowModel != null) {
                // если строка отчёта за предыдущий раунд представлена
                amountOfTakenAnswersInPreviousRound = previousRoundRowModel.getAmountOfTakenAnswersInThisRound();
            }
        }

        private boolean isAnswerAccepted(int questionNumber, long teamId, int roundNumber) {
            TypedQuery<Answer> query =
                    entityManager.createQuery("select answer from Answer answer " +
                                    "where answer.teamId=:teamId and answer.questionNumber=:questionNumber " +
                                    "and answer.roundNumber=:roundNumber and answer.grade=:grade " +
                                    "order by answer.emailSentOn desc",
                            Answer.class);

            query.setParameter("teamId", teamId);
            query.setParameter("questionNumber", questionNumber);
            query.setParameter("roundNumber", roundNumber);
            query.setParameter("grade", Grade.Accepted);

            final List<Answer> result = query.getResultList();
            return result != null && result.size() > 0;
        }

        void recalculateTeamRating() {
            final Map<Integer, Integer> actualRatingMap = isMainRound ? mainRoundQuestionsRatingMap :
                    preliminaryRoundQuestionsRatingMap;
            teamRating = 0;
            int questionNumber = minQuestionNumber;
            for (boolean answerFlag : answerFlags) {
                if (answerFlag && allQuestionGradesMap.get(questionNumber)) {
                    // если ответ взят и задание является зачётным, то рейтин задания учитывается
                    // в рейтинге команды
                    teamRating = teamRating + actualRatingMap.get(questionNumber);
                }
                questionNumber++;
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

        public int getAmountOfTakenAnswersInPreviousRound() {
            return amountOfTakenAnswersInPreviousRound;
        }

        public int getTeamRating() {
            return teamRating;
        }

        public String getTeamTitle() {
            return teamTitle;
        }

        @Override
        public int compareTo(ReportRowModel anotherRowModel) {
            /*
              Сперва идёт сравнение по teamRating
              Затем по количеству взятых вопросов в текущем раунде.
              Потом по количеству взятых вопросов в предыдущем раунде.
              А затем уже по названию команды.
              Сортировка по числовым показателям у нас по убыванию, так что умножаем всё на -1.
              А сортировка по названиям - алфавитная в порядке возрастания.
             */

            /*
              Согласно пункту 9.2 регламента:

              9.2. Место команды в туре определяется ее результатом в основном зачете.
              В случае равенства дополнительным показателем служит результат команды в предварительном зачете.
              Если совпадает и этот показатель, соответствующие места в туре делятся.

              Так что сперва сравниваем по количеству ответов в основном зачёте.
              Затем по количеству отчётов в предварительном зачете.
              После - по рейтингу.
              Затем - по названию команды.

              Сортировка по числовым показателям у нас по убыванию, так что умножаем всё на -1.
              А сортировка по названиям - алфавитная в порядке возрастания.
             */

            if (this.amountOfTakenAnswersInThisRound == anotherRowModel.amountOfTakenAnswersInThisRound) {
                if (this.amountOfTakenAnswersInPreviousRound == anotherRowModel.amountOfTakenAnswersInPreviousRound) {
                    if (this.teamRating == anotherRowModel.teamRating) {
                        return this.teamTitle.compareTo(anotherRowModel.teamTitle);
                    } else {
                        return -1 * Integer.compare(this.teamRating, anotherRowModel.teamRating);
                    }
                } else {
                    return -1 * Integer.compare(this.amountOfTakenAnswersInPreviousRound, anotherRowModel.amountOfTakenAnswersInPreviousRound);
                }
            } else {
                return -1 * Integer.compare(this.amountOfTakenAnswersInThisRound, anotherRowModel.amountOfTakenAnswersInThisRound);
            }
        }
    }
}



