package com.github.cdefgah.poetica.reports.collection;

import com.github.cdefgah.poetica.model.Team;
import com.github.cdefgah.poetica.reports.collection.model.AnswerWithFrequency;
import com.github.cdefgah.poetica.reports.collection.model.CollectionReportModel;
import com.github.cdefgah.poetica.reports.collection.model.QuestionSummary;

import java.util.List;

public class CollectionReportView {

    private final CollectionReportModel reportModel;

    public CollectionReportView(CollectionReportModel reportModel) {
        this.reportModel = reportModel;
    }

    public String getReportText() {
        // return "Московское время генерации отчёта: " + reportModel.getReportGeneratedOnMSKTime() + "\n\n" +

        return reportModel.isReportModelIsConsistent() ? getMainReportText() : getConsistencyReportText();
    }

    private String getConsistencyReportText() {
        final StringBuilder sb = new StringBuilder();
        sb.append("ВНИМАНИЕ!\nОценки за идентичные ответы на одни и те-же задания для разных команд разнятся.\n");
        sb.append("Ниже дана информация об этом. Пожалуйста скорректируйте оценки, чтобы подобного не было.\n");
        sb.append("В противном случае отчёт 'Собрание сочинений' не может быть корректно построен.\n\n\n");

        final List<ConsistencyReportRecord> consistencyReportRecords  = reportModel.getConsistencyReportRecords();
        for (ConsistencyReportRecord record: consistencyReportRecords) {
            sb.append("ВОПРОС ").append(record.getQuestionNumber()).append(":\n");
            sb.append("ОТВЕТ: ").append(record.getAnswerBody()).append(":\n\n");
            sb.append("Зачтён для команд:\n");

            final List<Team> acceptedTeams = record.getAnswerAcceptedFor();
            for (Team team: acceptedTeams) {
                sb.append("+ ").append(team.getTitle()).append(" (").append(team.getNumber()).append(")\n");
            }

            sb.append("Не зачтён для команд:\n");
            final List<Team> declinedTeams = record.getAnswerDeclinedFor();
            for (Team team: declinedTeams) {
                sb.append("- ").append(team.getTitle()).append(" (").append(team.getNumber()).append(")\n");
            }

            sb.append("------------------------------------------------------------------------\n\n");
        }

        return sb.toString();
    }

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
}
