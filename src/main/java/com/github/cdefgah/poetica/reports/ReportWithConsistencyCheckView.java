/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.reports;

import com.github.cdefgah.poetica.model.Team;

import java.util.List;

/**
 * Прототип класса для представлений отчётов с проверкой непротиворечивости данных.
 */
public abstract class ReportWithConsistencyCheckView extends AbstractReportView {

    /**
     * Конструктор класса.
     * @param reportModel модель данных отчёта.
     */
    public ReportWithConsistencyCheckView(ReportWithConsistencyCheckModel reportModel) {
        super(reportModel);
    }

    /**
     * Формирует и отдаёт текст отчёта.
     * @return текст отчёта.
     */
    public String getReportText() {
        ReportWithConsistencyCheckModel reportWithConsistencyCheckModel = (ReportWithConsistencyCheckModel)reportModel;
        StringBuilder sb = new StringBuilder();
        sb.append("Московское время генерации отчёта: ").append(reportModel.getReportGeneratedOnMSKTime()).
                append("\n\n");

        if (reportWithConsistencyCheckModel.isReportModelConsistent()) {
            final String notGradedQuestionsMessage = getNotGradedQuestionsMessage();
            if (!notGradedQuestionsMessage.isEmpty()) {
                sb.append(notGradedQuestionsMessage).append("\n\n");
            }

            sb.append(getMainReportText());
        } else {
            sb.append(getConsistencyReportText());
        }

        return sb.toString();
    }

    /**
     * Возвращает заголовок отчёта о непротиворечивости данных.
     * @return заголовок отчёта о непротиворечивости данных.
     */
    protected abstract String getReportTitleForConsistencyReportHeader();

    /**
     * Возвращает текст основного отчёта.
     * @return текст основного отчёта.
     */
    protected abstract String getMainReportText();

    /**
     * Возвращает текст для отчёта о непротиворечивости данных.
     * @return текст для отчёта о непротиворечивости данных.
     */
    protected String getConsistencyReportText() {
        ReportWithConsistencyCheckModel collectionReportModel = (ReportWithConsistencyCheckModel)reportModel;

        final StringBuilder sb = new StringBuilder();
        sb.append("ВНИМАНИЕ!\nОценки за идентичные ответы на одни и те-же задания для разных команд разнятся.\n");
        sb.append("Ниже дана информация об этом. Пожалуйста скорректируйте оценки, чтобы подобного не было.\n");
        sb.append("В противном случае отчёт '").append(getReportTitleForConsistencyReportHeader()).
                append("' не может быть корректно построен.\n\n\n");

        List<ReportWithConsistencyCheckModel.ConsistencyReportRow> consistencyReportRows =
                collectionReportModel.getConsistencyReportRows();

        for (ReportWithConsistencyCheckModel.ConsistencyReportRow row : consistencyReportRows) {
            sb.append("Вопрос №").append(row.getQuestionNumber()).append("\n");
            sb.append("Ответ: ").append(row.getAnswerBody()).append("\n");
            sb.append("Зачтён для команд:\n");
            for (Team team: row.getAnswerAcceptedFor()) {
                sb.append("+ ").append(team.getTitle()).append(" (").append(team.getNumber()).append(")\n");
            }
            sb.append("\n\n");
            sb.append("Не зачтён для команд:\n");
            for (Team team: row.getAnswerDeclinedFor()) {
                sb.append("- ").append(team.getTitle()).append(" (").append(team.getNumber()).append(")\n");
            }
            sb.append("\n");
            sb.append("----------------------------------------------------------------------------------\n\n");
        }

        return sb.toString();
    }
}
