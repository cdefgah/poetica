package com.github.cdefgah.poetica.reports.collection;

import com.github.cdefgah.poetica.model.Team;
import com.github.cdefgah.poetica.reports.collection.model.AnswerFrequencySummary;
import com.github.cdefgah.poetica.reports.collection.model.CollectionReportModel;
import com.github.cdefgah.poetica.reports.collection.model.ConsistencyReportRecord;
import com.github.cdefgah.poetica.reports.collection.model.QuestionNumberAndAnswerPair;

import java.util.List;
import java.util.Map;

public class CollectionReportView {

    private final CollectionReportModel reportModel;

    public CollectionReportView(CollectionReportModel reportModel) {
        this.reportModel = reportModel;
    }

    public String getReportText() {
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
        ВОТ ТУТ Я ЗАПУТАЛСЯ

        НАДО ГРУППИРОВАТЬ ПО ЗАСЧИТАНО/НЕЗАСЧИТАНО - и надо делать в модели скорее всего.

        иду спать. уже понедельник, с утра на работу :)

        final StringBuilder sb = new StringBuilder();
        final Map<QuestionNumberAndAnswerPair, AnswerFrequencySummary> reportBodyMap = reportModel.getReportBodyMap();
        int processingQuestionNumber = -1;
        boolean currentAcceptedFlag; // для определения момента, когда происходит смена курса

        for (QuestionNumberAndAnswerPair questionNumberAndAnswerPair : reportBodyMap.keySet()) {
            final AnswerFrequencySummary answerFrequencySummary = reportBodyMap.get(questionNumberAndAnswerPair);

            if (processingQuestionNumber != questionNumberAndAnswerPair.getQuestionNumber()) {
                processingQuestionNumber = questionNumberAndAnswerPair.getQuestionNumber();
                sb.append("ВОПРОС ").append(processingQuestionNumber).append(":\n\n");



                sb.append("ЗАСЧИТАНО: ")

            }

        }

        return sb.toString();
    }
}
