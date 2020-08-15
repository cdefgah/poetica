package com.github.cdefgah.poetica.reports.collection;

import com.github.cdefgah.poetica.reports.collection.model.CollectionReportModel;

import java.util.Map;

public class CollectionReportView {

    private final CollectionReportModel reportModel;

    public CollectionReportView(CollectionReportModel reportModel) {
        this.reportModel = reportModel;
    }

    public String getReportText() {
        Map<CollectionReportModel.AnswerNumberAndBody, Integer> frequencyMap = reportModel.getFrequencyMap();
        StringBuilder sb = new StringBuilder();

        int currentProcessingQuestionNumber = -1;
        for (CollectionReportModel.AnswerNumberAndBody oneRecord : frequencyMap.keySet()) {
            if (oneRecord.getQuestionNumber() != currentProcessingQuestionNumber) {
                currentProcessingQuestionNumber = oneRecord.getQuestionNumber();

                // смена номера вопроса, либо первый вопрос в отчёте
                sb.append("\nВОПРОС ").append(oneRecord.getQuestionNumber()).append(":\n\n");

                // этот раздел всегда указывается как и 'НЕ ЗАСЧИТАНО'
                sb.append("ЗАСЧИТАНО\n");
            }

            if (!oneRecord.isAccepted()) {
                // а если при смене номера засчитанных ответов нет, и пошли незасчитанные
                sb.append("\n\nНЕ ЗАСЧИТАНО:\n");
            }

            sb.append(oneRecord.isAccepted() ? '+' : '-').append(" ");
            sb.append(oneRecord.getAnswerBody());

            // получаем количество повторений ответа
            final int amount = frequencyMap.get(oneRecord);
            if (amount > 1) {
                sb.append(" [").append(amount).append("]");
            }
            sb.append("\n");
        }

        return sb.toString();
    }
}
