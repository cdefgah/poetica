/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.reports.collection.model;

import com.github.cdefgah.poetica.model.Answer;
import com.github.cdefgah.poetica.reports.ReportWithConsistencyCheckModel;
import com.github.cdefgah.poetica.reports.collection.model.comparators.QuestionNumberAnswerBodyAndCommentComparator;

import javax.persistence.EntityManager;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Модель отчёта "Собрание сочинений".
 */
public final class CollectionReportModel extends ReportWithConsistencyCheckModel {

    /**
     * Список блоков данных с информацией по ответам.
     */
    private final List<AnswerSummaryBlock> answerSummaryBlocks = new ArrayList<>();

    /**
     * Конструктор класса.
     * @param entityManager менеджер сущностей для работы с базой данных.
     */
    public CollectionReportModel(EntityManager entityManager) {
        super(entityManager);
    }

    /**
     * Отдаёт неизменяемый список блоков данных с информацией по ответам.
     * @return неизменяемый список блоков данных с информацией по ответам.
     */
    public List<AnswerSummaryBlock> getAnswerSummaryBlocks() {
        return Collections.unmodifiableList(answerSummaryBlocks);
    }

    /**
     * Строит отчёт.
     */
    protected void buildMainReport() {
        // сортируем список ответов по номеру и телу ответа вместе с комментарием
        this.allRecentAnswersList.sort(new QuestionNumberAnswerBodyAndCommentComparator());

        Answer processingAnswer = this.allRecentAnswersList.get(0);
        int currentProcessingQuestionNumber = processingAnswer.getQuestionNumber();
        String currentProcessingAnswerBodyWithComment = processingAnswer.getBodyWithComment();
        boolean currentIsAcceptedFlag = processingAnswer.isAccepted();
        int totalCount = 1;

        AnswerSummaryBlock answerSummaryBlock = new AnswerSummaryBlock(currentProcessingQuestionNumber);

        for (int i = 1; i < allRecentAnswersList.size(); i++) {
            processingAnswer = allRecentAnswersList.get(i);
            if (processingAnswer.getQuestionNumber() != currentProcessingQuestionNumber) {
                // сменился номер вопроса
                // следовательно должен смениться answerSummaryBlock

                // фиксируем текущую ситуацию в текущем answerSummaryBlock
                answerSummaryBlock.registerAnswer(currentProcessingAnswerBodyWithComment,
                                                                                    totalCount, currentIsAcceptedFlag);

                // добавляем сформированный блок в список
                answerSummaryBlocks.add(answerSummaryBlock);

                // инициализируем новый блок
                currentProcessingQuestionNumber = processingAnswer.getQuestionNumber();
                currentProcessingAnswerBodyWithComment = processingAnswer.getBodyWithComment();
                currentIsAcceptedFlag = processingAnswer.isAccepted();
                totalCount = 1;

                answerSummaryBlock = new AnswerSummaryBlock(currentProcessingQuestionNumber);


            } else if (!processingAnswer.getBodyWithComment().equals(currentProcessingAnswerBodyWithComment)) {
                // сменился ответ внутри answerSummaryBlock
                answerSummaryBlock.registerAnswer(currentProcessingAnswerBodyWithComment,
                                                                                    totalCount, currentIsAcceptedFlag);

                currentProcessingAnswerBodyWithComment = processingAnswer.getBodyWithComment();
                totalCount = 1;
                currentIsAcceptedFlag = processingAnswer.isAccepted();

            } else {
                // ответ не меняется
                totalCount++;
            }
        }

        // фиксируем последний объект
        answerSummaryBlock.registerAnswer(currentProcessingAnswerBodyWithComment, totalCount, currentIsAcceptedFlag);

        // добавляем его в список
        answerSummaryBlocks.add(answerSummaryBlock);
    }


    // ==========================================================================================================

    /**
     * Блок с информацией об ответах.
     */
    public static final class AnswerSummaryBlock {
        /**
         * Номер вопроса (задания).
         */
        private final int questionNumber;

        /**
         * Список зачтённых ответов.
         */
        private final List<AnswerSummaryRow> acceptedAnswers = new ArrayList<>();

        /**
         * Список незачтённых ответов.
         */
        private final List<AnswerSummaryRow> declinedAnswers = new ArrayList<>();

        /**
         * Конструктор класса.
         * @param questionNumber номер вопроса (задания).
         */
        public AnswerSummaryBlock(int questionNumber) {
            this.questionNumber = questionNumber;
        }

        /**
         * Регистрирует ответ.
         * @param answerBodyWithComment тело ответа вместе с комментарием к нему.
         * @param totalCount общее количество таких-же ответов.
         * @param isAccepted true, если ответ зачтён.
         */
        public void registerAnswer(String answerBodyWithComment, int totalCount, boolean isAccepted) {
            if (isAccepted) {
                this.acceptedAnswers.add(new AnswerSummaryRow(answerBodyWithComment, totalCount));
            } else {
                this.declinedAnswers.add(new AnswerSummaryRow(answerBodyWithComment, totalCount));
            }
        }

        /**
         * Отдаёт номер вопроса (задания).
         * @return номер вопроса (задания).
         */
        public int getQuestionNumber() {
            return questionNumber;
        }

        /**
         * Отдаёт неизменяемый список зачтённых заданий.
         * @return неизменяемый список зачтённых заданий.
         */
        public List<AnswerSummaryRow> getAcceptedAnswers() {
            return Collections.unmodifiableList(acceptedAnswers);
        }

        /**
         * Отдаёт неизменяемый список незачтённых заданий.
         * @return неизменяемый список незачтённых заданий.
         */
        public List<AnswerSummaryRow> getDeclinedAnswers() {
            return Collections.unmodifiableList(declinedAnswers);
        }

        // =====================================================================================================

        /**
         * Строка с информацией об ответе с комментарием к нему и количестве таких-же ответов с таким-же комментарием.
         */
        public static final class AnswerSummaryRow {

            /**
             * Тело ответа с комментарием.
             */
            private final String answerBodyWithComment;

            /**
             * Общее количество таких-же ответов с комментарием.
             */
            private final int totalCount;

            /**
             * Конструктор класса.
             * @param answerBodyWithComment Тело ответа с комментарием.
             * @param totalCount Общее количество таких-же ответов с комментарием.
             */
            public AnswerSummaryRow(String answerBodyWithComment, int totalCount) {
                this.answerBodyWithComment = answerBodyWithComment;
                this.totalCount = totalCount;
            }

            /**
             * Отдаёт строку с телом ответа с комментарием.
             * @return строка с телом ответа с комментарием.
             */
            public String getAnswerBodyWithComment() {
                return answerBodyWithComment;
            }

            /**
             * Отдаёт общее количество таких-же ответом с таким-же комментарием.
             * @return общее количество таких-же ответом с таким-же комментарием.
             */
            public int getTotalCount() {
                return totalCount;
            }

            /**
             * Отдаёт строковое представление объекта.
             * @return строковое представление объекта.
             */
            @Override
            public String toString() {
               if (totalCount > 1) {
                   return this.answerBodyWithComment + " [" + totalCount + "]";
               } else {
                   return this.answerBodyWithComment;
               }
            }
        }
    }
}