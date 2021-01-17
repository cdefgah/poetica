/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.reports.restable;

import com.github.cdefgah.poetica.reports.restable.model.ResultTableReportModel;

import java.util.Collection;
import java.util.Map;

// TODO код в отчётах повторяется, вынести за скобки повторящийся код
public final class ShortResultTableReportView  extends AbstractResultTableReportView {

    /**
     * Конструктор класса.
     * @param reportModel модель данных отчёта "Таблица результатов".
     */
    public ShortResultTableReportView(ResultTableReportModel reportModel) {
        super(reportModel);
    }

    /**
     * Формирует блок данных отчёта для того или иного раунда игры.
     * @param isMainRound true, если нужны данные для основного раунда (тура).
     * @return блок данных отчёта для того или иного раунда игры.
     */
    @Override
    protected String getRoundBlockText(boolean isMainRound) {
        final String oneSpace = " ";
        final String twoSpaces = oneSpace + oneSpace;
        final StringBuilder sb = new StringBuilder();

        // заголовок блока
        sb.append(getBlockTitle(isMainRound)).append("\n");

        // первая строка тела блока
        sb.append(getRightAlignedText(maxTeamNumberLength, "N")).append(twoSpaces);

        int shorthandForQuestionNumber = 0;
        for (int questionNumber = reportModel.getMinQuestionNumber();
             questionNumber <= reportModel.getMaxQuestionNumber(); questionNumber++) {
            shorthandForQuestionNumber++;
            if (shorthandForQuestionNumber > 9) {
                shorthandForQuestionNumber = 0;
            }

            sb.append(shorthandForQuestionNumber);
        }
        sb.append(oneSpace);

        sb.append(getRightAlignedText(maxTakenAnswersDigestLength, "О"));
        sb.append(oneSpace);
        sb.append(getRightAlignedText(getMaxTeamRatingLength(isMainRound), "Р"));
        sb.append(oneSpace);
        sb.append("КОМАНДА");
        sb.append("\n");

        // формируем тело блока
        Collection<ResultTableReportModel.ReportRowModel> reportModelRows = getReportModelRows(isMainRound);
        for (ResultTableReportModel.ReportRowModel oneModelRow: reportModelRows) {
            sb.append(getRightAlignedText(maxTeamNumberLength, String.valueOf(oneModelRow.getTeamNumber())));
            sb.append(twoSpaces);

            // выводим + и - в зависимости от того, взят-ли вопрос
            final boolean[] answerFlags = oneModelRow.getAnswerFlags();
            for (boolean answerFlag: answerFlags) {
                String gradeSymbol = answerFlag ? "+" : "-";
                sb.append(gradeSymbol);
            }

            sb.append(oneSpace);
            
            // выводим информацию о количестве взятых в предыдущем и текущем турах вопросах
            sb.append(getRightAlignedNumber(maxQuestionNumberLength, oneModelRow.getAmountOfCorrectAnswersInThisRound()));
            sb.append(".");
            sb.append(getRightAlignedNumber(maxQuestionNumberLength,
                    oneModelRow.getAmountOfCorrectAnswersInPreviousRound()));
            sb.append(oneSpace);
            sb.append(getRightAlignedText(getMaxTeamRatingLength(isMainRound),
                    String.valueOf(oneModelRow.getTeamRating())));

            sb.append(oneSpace);
            sb.append(oneModelRow.getTeamTitle());
            sb.append("\n");
        }

        // строка с рейтингом вопросов
        sb.append("Рейтинг\n");
        // номера вопросов сперва выписываем в строку
        for (int questionNumber = reportModel.getMinQuestionNumber();
             questionNumber <= reportModel.getMaxQuestionNumber(); questionNumber++) {

            sb.append(getRightAlignedText(blockBodyColumnLength, String.valueOf(questionNumber))).append(oneSpace);
        }
        sb.append("\n");

        final ResultTableReportModel resultTableReportModel = (ResultTableReportModel)reportModel;

        // на новой строке - рейтинг вопросов
        final Map<Integer, Integer> questionsRatingMap = resultTableReportModel.getQuestionsRatingMap(isMainRound);
        for (int questionNumber = reportModel.getMinQuestionNumber();
             questionNumber <= reportModel.getMaxQuestionNumber(); questionNumber++) {

            final int questionRating = questionsRatingMap.get(questionNumber);
            sb.append(getRightAlignedText(blockBodyColumnLength, String.valueOf(questionRating)));
            sb.append(oneSpace);
        }

        sb.append("\n");
        return sb.toString();
    }
}
