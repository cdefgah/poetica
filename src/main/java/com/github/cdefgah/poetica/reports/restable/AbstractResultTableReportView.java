package com.github.cdefgah.poetica.reports.restable;

import com.github.cdefgah.poetica.model.Team;
import com.github.cdefgah.poetica.reports.restable.model.ResultTableReportModel;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.util.Collection;
import java.util.Collections;

abstract class AbstractResultTableReportView {

    /**
     * Менеджер сущностей для взаимодействия с базой данных.
     */
    protected final EntityManager entityManager;

    protected final ResultTableReportModel reportModel;

    protected final int maxTeamNumberLength = Team.getMaxTeamNumberValueLength();

    protected final int maxQuestionNumberLength;

    protected final int maxTakenAnswersDigestLength;

    private final int maxTeamRatingLengthForPreliminaryRound;

    private final int maxTeamRatingLengthForMainRound;

    public AbstractResultTableReportView(ResultTableReportModel reportModel) {
        this.reportModel = reportModel;
        this.entityManager = reportModel.getEntityManager();

        maxQuestionNumberLength = getMaxQuestionNumberLength();

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
                return isMainRound ? reportModel.getMainRoundBlockReportRows() :
                                                            reportModel.getPreliminaryRoundBlockReportRows();
    }

    private int getMaxTeamRatingValueLength(boolean isMainRound) {
        final Collection<ResultTableReportModel.ReportRowModel> reportRows =
                                         isMainRound ? reportModel.getMainRoundBlockReportRows() :
                                                                       reportModel.getPreliminaryRoundBlockReportRows();
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
}
