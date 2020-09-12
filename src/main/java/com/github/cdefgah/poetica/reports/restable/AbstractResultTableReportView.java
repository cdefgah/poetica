/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.reports.restable;

import com.github.cdefgah.poetica.model.Team;
import com.github.cdefgah.poetica.reports.ReportWithConsistencyCheckView;
import com.github.cdefgah.poetica.reports.restable.model.ResultTableReportModel;

import javax.persistence.TypedQuery;
import java.util.Collection;
import java.util.Collections;

abstract class AbstractResultTableReportView extends ReportWithConsistencyCheckView {

    protected final int maxTeamNumberLength = Team.getMaxTeamNumberValueLength();

    protected final int maxQuestionNumberLength;

    protected final int maxTakenAnswersDigestLength;

    private final int maxTeamRatingLengthForPreliminaryRound;

    private final int maxTeamRatingLengthForMainRound;

    protected final int maxQuestionRatingLength;

    // ширина колонки, в которой показываются номера вопросов
    // отметки + -
    // и рейтинг вопросов
    // вычисляется как максимум между
    // максимальной длиной в символах максимального вопроса
    // и максимальной длиной в символах максимального рейтинга
    protected final int blockBodyColumnLength;

    public AbstractResultTableReportView(ResultTableReportModel reportModel) {
        super(reportModel);

        maxQuestionNumberLength = getMaxQuestionNumberLength();
        maxQuestionRatingLength = getMaxQuestionRatingLength();
        blockBodyColumnLength = Math.max(maxQuestionNumberLength, maxQuestionRatingLength);

        // это длина раздела, в котором показано сколько вопросов взято в текущем (для блока) и предыдущем (для блока)
        // раундах. Выглядит он вот так: 12.34
        // где 12 - количество вопросов, взятых в предыдущем для блока отчёта раунде,
        // а 34 - количество вопросов, взятых в текущем для блока отчёта раунде.
        // максимальная длина номера вопроса у нас = maxQuestionNumberLength
        // так что мы умножаем её на два и прибавляем единицу (для точки, что посередине).
        maxTakenAnswersDigestLength = maxQuestionNumberLength * 2 + 1;

        maxTeamRatingLengthForPreliminaryRound = getMaxTeamRatingValueLength(false);
        maxTeamRatingLengthForMainRound = getMaxTeamRatingValueLength(true);
    }

    @Override
    protected String getReportTitleForConsistencyReportHeader() {
        return "Таблица результатов";
    }

    @Override
    public String getMainReportText() {
        return getRoundBlockText(false) +
                "\n" +
                getRoundBlockText(true);
    }

    protected abstract String getRoundBlockText(boolean isMainRound);

    protected int getMaxTeamRatingLength(boolean isMainRound) {
        return isMainRound ? this.maxTeamRatingLengthForMainRound : this.maxTeamRatingLengthForPreliminaryRound;
    }

    /**
     * Формирует и отдаёт выровненный по правому краю текст.
     * @param placeHolderLength длина поля в символах, в котором будет располагаться текст.
     * @param text текст, который должен быть выровнен по правому краю пробелами.
     * @return выровненный по правому краю пробелами текст.
     */
    protected String getRightAlignedText(int placeHolderLength, String text) {
        return getRightAlignedText(placeHolderLength, text, ' ');
    }

    protected String getRightAlignedNumber(int placeHolderLength, int number) {
        return getRightAlignedText(placeHolderLength, String.valueOf(number), '0');
    }

    private String getRightAlignedText(int placeHolderLength, String text, char spacerSymbol) {
        final int lengthDelta = placeHolderLength - text.length();
        if (lengthDelta > 0) {
            return String.join("", Collections.nCopies(lengthDelta, String.valueOf(spacerSymbol))) + text;
        } else {
            return text;
        }
    }

    protected String getBlockTitle(boolean isTheMainRound) {
        return "ЗАЧЁТ  " + (isTheMainRound ? "Основной" : "Предварительный");
    }

    protected Collection<ResultTableReportModel.ReportRowModel> getReportModelRows(boolean isMainRound) {
        final ResultTableReportModel resultTableReportModel = (ResultTableReportModel)reportModel;

        return isMainRound ? resultTableReportModel.getMainRoundBlockReportRows() :
                        resultTableReportModel.getPreliminaryRoundBlockReportRows();
    }

    private int getMaxTeamRatingValueLength(boolean isMainRound) {
        final ResultTableReportModel resultTableReportModel = (ResultTableReportModel)reportModel;

        final Collection<ResultTableReportModel.ReportRowModel> reportRows =
                                         isMainRound ? resultTableReportModel.getMainRoundBlockReportRows() :
                                                 resultTableReportModel.getPreliminaryRoundBlockReportRows();
        final int maxTeamRating = reportRows.stream().
                                        mapToInt(ResultTableReportModel.ReportRowModel::getTeamRating).
                                                                    filter(oneRow -> oneRow >= 0).max().orElse(0);
        return String.valueOf(maxTeamRating).length();
    }

    /**
     * Возвращает максимальную длину в символах номера вопроса (задания).
     * @return максимальная длина в символах номера вопроса (задания).
     */
    private int getMaxQuestionNumberLength() {
        final String queryString = "select max(question.highestInternalNumber) FROM Question question";
        final TypedQuery<Integer> query = entityManager.createQuery(queryString, Integer.class);
        final Integer maxValueObject = query.getSingleResult();
        final int maxValueObjectNumber = maxValueObject != null ? maxValueObject : 0;
        return String.valueOf(maxValueObjectNumber).length();
    }

    private int getMaxQuestionRatingLength() {
        // рейтинг вопроса вычисляется как = 1 + (число команд не взявших вопрос).
        final String queryString = "select count(*) FROM Team team";
        final TypedQuery<Long> query = entityManager.createQuery(queryString, Long.class);
        final long totalTeamsQty = query.getSingleResult();

        return String.valueOf(1 + totalTeamsQty).length();
    }
}
