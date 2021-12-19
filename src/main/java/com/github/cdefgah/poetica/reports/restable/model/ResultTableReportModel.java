/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.reports.restable.model;

import com.github.cdefgah.poetica.model.Grade;
import com.github.cdefgah.poetica.model.Question;
import com.github.cdefgah.poetica.model.Team;
import com.github.cdefgah.poetica.reports.ReportWithConsistencyCheckModel;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Модель класса отчёта "Таблица результатов".
 */
public final class ResultTableReportModel extends ReportWithConsistencyCheckModel {

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

    /**
     * Конструктор класса.
     * @param entityManager менеджер сущностей для взаимодействия с базой данных.
     */
    public ResultTableReportModel(EntityManager entityManager) {
        super(entityManager);
    }

    /**
     * Строит отчёт.
     */
    protected void buildMainReport() {
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

    /**
     * Формирует блок данных отчёта за предварительный тур (раунд).
     * @return список строк отчёта с информацией за предварительный раунд.
     */
    public Collection<ReportRowModel> getPreliminaryRoundBlockReportRows() {
        return Collections.unmodifiableCollection(preliminaryRoundBlockReportRows);
    }

    /**
     * Формирует блок данных отчёта за основной тур (раунд).
     * @return список строк отчёта с информацией за основной раунд.
     */
    public Collection<ReportRowModel> getMainRoundBlockReportRows() {
        return Collections.unmodifiableCollection(mainRoundBlockReportRows);
    }

    /**
     * Формирует таблицу для быстрого получения оценки ответа по номеру задания.
     */
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

    /**
     * Отдаёт неизменяемую таблицу с информацией о рейтингах заданий.
     * @param isMainRound true, если нужны рейтинги заданий за основной тур игры.
     * @return неизменяемая таблица с рейтингами заданий.
     */
    public Map<Integer, Integer> getQuestionsRatingMap(boolean isMainRound) {
        return Collections.unmodifiableMap(isMainRound ?
                this.mainRoundQuestionsRatingMap : this.preliminaryRoundQuestionsRatingMap);
    }

    /**
     * Отдаёт неизменяемую таблицу с информацией об оценках заданий.
     * @return неизменяемая таблица с информацией об оценках заданий.
     */
    public Map<Integer, Boolean> getAllQuestionGradesMap() {
        return Collections.unmodifiableMap(allQuestionGradesMap);
    }

    // ===========================================================================================================

    /**
     * Представляет собой модель данных для строки отчёта.
     */
    public final class ReportRowModel implements Comparable<ReportRowModel> {

        /**
         * Номер команды.
         */
        private final int teamNumber;

        /**
         * Оценки ответов команды (true - зачтён).
         */
        private final boolean[] answerFlags;

        /**
         * Количество зачтённых ответов в текущем туре (раунде).
         */
        private final int amountOfTakenAnswersInThisRound;

        /**
         * Количество зачтённых ответов в предыдущем туре (раунде).
         */
        private int amountOfTakenAnswersInPreviousRound;

        /**
         * Рейтинг команды.
         */
        private int teamRating;

        /**
         * Название команды.
         */
        private final String teamTitle;

        /**
         * true, если строка отчёта содержит информацию по основному туру (раунду).
         */
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
                amountOfTakenAnswersInPreviousRound = previousRoundRowModel.getAmountOfCorrectAnswersInThisRound();
            }
        }

        /**
         * Возвращает true, если ответ был зачтён.
         * @param questionNumber номер задания.
         * @param teamId уникальный идентификатор команды.
         * @param roundNumber номер тура (раунда).
         * @return true, если ответ был зачтён.
         */
        private boolean isAnswerAccepted(int questionNumber, long teamId, int roundNumber) {
            TypedQuery<Long> query =
                    entityManager.createQuery("select count(*) from Answer answer " +
                                    "where answer.teamId=:teamId and answer.questionNumber=:questionNumber " +
                                    "and answer.roundNumber=:roundNumber and answer.grade=:grade",
                            Long.class);

            query.setParameter("teamId", teamId);
            query.setParameter("questionNumber", questionNumber);
            query.setParameter("roundNumber", roundNumber);
            query.setParameter("grade", Grade.Accepted);

            return query.getSingleResult() > 0;
        }

        /**
         * Обновляет рейтинг команды.
         */
        private void recalculateTeamRating() {
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

        /**
         * Возвращает номер команды.
         * @return номер команды.
         */
        public int getTeamNumber() {
            return teamNumber;
        }

        /**
         * Отдаёт массив флагов с оценками ответов.
         * @return массив флагов с оценками ответов.
         */
        public boolean[] getAnswerFlags() {
            return answerFlags;
        }

        /**
         * Возвращает количество зачтённых ответов в текущем раунде (туре).
         * @return количество зачтённых ответов в текущем раунде (туре).
         */
        public int getAmountOfCorrectAnswersInThisRound() {
            return amountOfTakenAnswersInThisRound;
        }

        /**
         * Отдаёт количество зачтённых ответов в предыдущем раунде (туре).
         * @return количество зачтённых ответов в предыдущем раунде (туре).
         */
        public int getAmountOfCorrectAnswersInPreviousRound() {
            return amountOfTakenAnswersInPreviousRound;
        }

        /**
         * Возвращает рейтинг команды.
         * @return рейтинг команды.
         */
        public int getTeamRating() {
            return teamRating;
        }

        /**
         * Возвращает название команды.
         * @return название команды.
         */
        public String getTeamTitle() {
            return teamTitle;
        }

        /**
         * Выполняет сравнение двух строк отчёта.
         * @param anotherRowModel другая срока отчёта для сравнения с текущей.
         * @return 0, если строки равны, -1, если текущая строка меньше, чем переданная в параметрах,
         * и 1 - если текущая строка больше, чем переданная в параметрах.
         */
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
                    return -1 * Integer.compare(this.amountOfTakenAnswersInPreviousRound,
                                                                   anotherRowModel.amountOfTakenAnswersInPreviousRound);
                }
            } else {
                return -1 * Integer.compare(this.amountOfTakenAnswersInThisRound,
                                                                       anotherRowModel.amountOfTakenAnswersInThisRound);
            }
        }
    }
}
