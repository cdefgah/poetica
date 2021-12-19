/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.reports.summary;

import com.github.cdefgah.poetica.reports.AbstractReportView;
import com.github.cdefgah.poetica.reports.summary.model.SummaryReportModel;

/**
 * Представление отчёта "Сводка".
 */
public final class SummaryReportView extends AbstractReportView {

    /**
     * Конструктор класса.
     * @param reportModel модель данных отчёта "Сводка".
     */
    public SummaryReportView(SummaryReportModel reportModel) {
        super(reportModel);
    }

    /**
     * Формирует текст с телом отчёта.
     * @return текст с телом отчёта.
     */
    public String getReportText() {
        final StringBuilder sb = new StringBuilder();

        final String notGradedQuestionsMessage = getNotGradedQuestionsMessage();
        if (!notGradedQuestionsMessage.isEmpty()) {
            sb.append(notGradedQuestionsMessage).append("\n\n");
        }

        final SummaryReportModel summaryReportModel = (SummaryReportModel)reportModel;

        final String roundName =summaryReportModel.getRoundNumber() == 1 ? "'Предварительный'" : "'Основной'";

        sb.append("Уважаемые знатоки!\n\n");
        sb.append("С вами говорит робот дежурной команды.\n\n");
        sb.append("На момент: ").append(reportModel.getReportGeneratedOnMSKTime()).append(" MSK в зачёте ");
        sb.append(roundName).append(" сданы ответы от команд:\n\n");

        for (SummaryReportModel.SummaryReportRow row: summaryReportModel.getSummaryReportRows()) {
            sb.append(row.toString()).append("\n");
        }
        sb.append("\n------------------\n");
        sb.append("Всего команд: ").append(summaryReportModel.getTotalTeamsCount()).append("\n");
        sb.append("Всего писем: ").append(summaryReportModel.getTotalEmailsCount()).append("\n");
        sb.append("\n\n--\n\nGood luck\n\n-Robot\n\n\n-----------------------------------------------");

        return sb.toString();
    }
}
