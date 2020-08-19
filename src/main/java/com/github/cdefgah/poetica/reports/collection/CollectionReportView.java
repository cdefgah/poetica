package com.github.cdefgah.poetica.reports.collection;

import com.github.cdefgah.poetica.model.Team;
import com.github.cdefgah.poetica.reports.collection.model.CollectionReportModel;

import java.util.List;

public class CollectionReportView {

    private final CollectionReportModel reportModel;

    public CollectionReportView(CollectionReportModel reportModel) {
        this.reportModel = reportModel;
    }

    public String getReportText() {
        StringBuilder sb = new StringBuilder();
        sb.append("Московское время генерации отчёта: ").append(reportModel.getReportGeneratedOnMSKTime()).
                append("\n\n");

        if (reportModel.isReportModelConsistent()) {
            sb.append(getMainReportText());
        } else {
            sb.append(getConsistencyReportText());
        }

        return sb.toString();
    }

    private String getConsistencyReportText() {
        final StringBuilder sb = new StringBuilder();
        sb.append("ВНИМАНИЕ!\nОценки за идентичные ответы на одни и те-же задания для разных команд разнятся.\n");
        sb.append("Ниже дана информация об этом. Пожалуйста скорректируйте оценки, чтобы подобного не было.\n");
        sb.append("В противном случае отчёт 'Собрание сочинений' не может быть корректно построен.\n\n\n");

        List<CollectionReportModel.ConsistencyReportRow> consistencyReportRows = reportModel.getConsistencyReportRows();
        for (CollectionReportModel.ConsistencyReportRow row : consistencyReportRows) {
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

    private String getMainReportText() {
        final StringBuilder sb = new StringBuilder();
        final List<CollectionReportModel.AnswerSummaryBlock> answerSummaryBlocks = reportModel.getAnswerSummaryBlocks();

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

/*
    private String getMainReportText() {
        final StringBuilder sb = new StringBuilder();
        final List<QuestionSummary> questionSummaries = reportModel.getQuestionSummariesList();
        for (QuestionSummary questionSummary : questionSummaries) {
            sb.append("ВОПРОС ").append(questionSummary.getQuestionNumber()).append(":\n");
            sb.append("ЗАСЧИТАНО:\n\n");
            if (questionSummary.getAcceptedCount() > 0) {
                final List<AnswerWithFrequency> acceptedAnswersList = questionSummary.getAcceptedAnswersSummary();
                for (AnswerWithFrequency answerWithFrequency : acceptedAnswersList) {
                    sb.append("+ ").append(answerWithFrequency.toString()).append("\n");
                }
            }

            sb.append("\n");
            sb.append("НЕ ЗАСЧИТАНО:\n\n");
            if (questionSummary.getDeclinedCount() > 0) {
                final List<AnswerWithFrequency> acceptedAnswersList = questionSummary.getDeclinedAnswersSummary();
                for (AnswerWithFrequency answerWithFrequency : acceptedAnswersList) {
                    sb.append("- ").append(answerWithFrequency.toString()).append("\n");
                }
            }
        }

        return sb.toString();
    }

     */
}
