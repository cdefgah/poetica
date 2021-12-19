/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.reports.collection;

import com.github.cdefgah.poetica.reports.ReportWithConsistencyCheckView;
import com.github.cdefgah.poetica.reports.collection.model.CollectionReportModel;

import java.util.List;

/**
 * Представление отчёта "Собрание сочинений".
 */
public final class CollectionReportView extends ReportWithConsistencyCheckView {

    /**
     * Конструктор класса.
     * @param reportModel модель отчёта "Собрание сочинений".
     */
    public CollectionReportView(CollectionReportModel reportModel) {
        super(reportModel);
    }

    /**
     * Отдаёт название отчёта.
     * @return название отчёта.
     */
    @Override
    protected String getReportTitleForConsistencyReportHeader() {
        return "Собрание сочинений";
    }

    /**
     * Отдаёт содержимое отчёта.
     * @return содержимое отчёта.
     */
    @Override
    protected String getMainReportText() {
        CollectionReportModel collectionReportModel = (CollectionReportModel)reportModel;

        final StringBuilder sb = new StringBuilder();
        final List<CollectionReportModel.AnswerSummaryBlock> answerSummaryBlocks =
                                                                    collectionReportModel.getAnswerSummaryBlocks();

        for (CollectionReportModel.AnswerSummaryBlock block : answerSummaryBlocks) {
            sb.append("ВОПРОС ").append(block.getQuestionNumber()).append(":\n\n");
            sb.append("ЗАСЧИТАНО:\n");
            for (CollectionReportModel.AnswerSummaryBlock.AnswerSummaryRow row: block.getAcceptedAnswers()) {
                sb.append("+ ").append(row.toString()).append("\n");
            }

            sb.append("\n\n");

            sb.append("НЕ ЗАСЧИТАНО:\n");
            for (CollectionReportModel.AnswerSummaryBlock.AnswerSummaryRow row: block.getDeclinedAnswers()) {
                sb.append("- ").append(row.toString()).append("\n");
            }

            sb.append("\n\n\n");
        }

        return sb.toString();
    }
}
