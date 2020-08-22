package com.github.cdefgah.poetica.reports.collection;

import com.github.cdefgah.poetica.model.Team;
import com.github.cdefgah.poetica.reports.AbstractReportView;
import com.github.cdefgah.poetica.reports.collection.model.CollectionReportModel;

import java.util.List;

public class CollectionReportView extends AbstractReportView {

    public CollectionReportView(CollectionReportModel reportModel) {
        super(reportModel);
    }

    public String getReportText() {
        CollectionReportModel collectionReportModel = (CollectionReportModel)reportModel;
        StringBuilder sb = new StringBuilder();
        sb.append("Московское время генерации отчёта: ").append(reportModel.getReportGeneratedOnMSKTime()).
                append("\n\n");

        if (collectionReportModel.isReportModelConsistent()) {
            sb.append(getMainReportText());
        } else {
            sb.append(getConsistencyReportText());
        }

        return sb.toString();
    }

    private String getConsistencyReportText() {
        CollectionReportModel collectionReportModel = (CollectionReportModel)reportModel;

        final StringBuilder sb = new StringBuilder();
        sb.append("ВНИМАНИЕ!\nОценки за идентичные ответы на одни и те-же задания для разных команд разнятся.\n");
        sb.append("Ниже дана информация об этом. Пожалуйста скорректируйте оценки, чтобы подобного не было.\n");
        sb.append("В противном случае отчёт 'Собрание сочинений' не может быть корректно построен.\n\n\n");

        List<CollectionReportModel.ConsistencyReportRow> consistencyReportRows =
                                                                    collectionReportModel.getConsistencyReportRows();

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
        CollectionReportModel collectionReportModel = (CollectionReportModel)reportModel;

        final StringBuilder sb = new StringBuilder();
        final String notGradedQuestionsMessage = getNotGradedQuestionsMessage();
        if (!notGradedQuestionsMessage.isEmpty()) {
            sb.append(notGradedQuestionsMessage).append("\n\n");
        }

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
