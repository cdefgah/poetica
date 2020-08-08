package com.github.cdefgah.poetica.reports.restable;

import com.github.cdefgah.poetica.reports.restable.model.ResultTableReportModel;
import org.springframework.beans.factory.annotation.Autowired;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

abstract class AbstractResultTableReportView {

    /**
     * Менеджер сущностей для взаимодействия с базой данных.
     */
    @Autowired
    EntityManager entityManager;

    protected ResultTableReportModel reportModel;

    protected final int maxTeamNumberLength;

    protected final int maxQuestionNumberLength;

    protected final int maxTakenAnswersDigestLength;

    private final int maxTeamRatingLengthForPreliminaryRound;

    private final int maxTeamRatingLengthForMainRound;

    public AbstractResultTableReportView(ResultTableReportModel reportModel) {
        this.reportModel = reportModel;
        maxQuestionNumberLength = getMaxQuestionNumberLength();
        maxTeamNumberLength = getMaxTeamNumberLength();

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
        final int lengthDelta = placeHolderLength - text.length();
        if (lengthDelta > 0) {
            return String.join("", Collections.nCopies(lengthDelta, " ")) + text;
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
     * Возвращает максимальную длину в символах номера команды.
     * @return максимальная длина в символах номера команды.
     */
    private int getMaxTeamNumberLength() {
        return getLengthOfMaxIntValueFromDatabase("select max(team.number) FROM Team team");
    }

    /**
     * Возвращает максимальную длину в символах номера вопроса (задания).
     * @return максимальная длина в символах номера вопроса (задания).
     */
    private int getMaxQuestionNumberLength() {
        return getLengthOfMaxIntValueFromDatabase("select max(question.highestInternalNumber) " +
                                                                                              "FROM Question question");
    }

    private int getLengthOfMaxIntValueFromDatabase(String queryString) {
        final TypedQuery<Integer> query = entityManager.createQuery(queryString, Integer.class);
        final Integer maxValueObject = query.getSingleResult();
        final int maxValueObjectNumber = maxValueObject != null ? maxValueObject : 0;
        return String.valueOf(maxValueObjectNumber).length();
    }
}
