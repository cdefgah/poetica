package com.github.cdefgah.poetica.reports.restable;

import com.github.cdefgah.poetica.reports.restable.model.ResultTableReportModel;

import java.util.Collection;
import java.util.Map;

public class MediumResultTableReportView extends AbstractResultTableReportView {

    public MediumResultTableReportView(ResultTableReportModel reportModel) {
        super(reportModel);
    }

    @Override
    protected String getRoundBlockText(boolean isMainRound) {
        final String oneSpace = " ";
        final String twoSpaces = oneSpace + oneSpace;
        final StringBuilder sb = new StringBuilder();

        String notGradedQuestionsInfo = getListedNotGradedQuestions();
        if (!notGradedQuestionsInfo.isEmpty()) {
            sb.append(notGradedQuestionsInfo).append("\n\n");
        }

        // заголовок блока
        sb.append(getBlockTitle(isMainRound)).append("\n");

        // первая строка тела блока
        sb.append(getRightAlignedText(maxTeamNumberLength, "N")).append(twoSpaces);

        final int groupSize = 5;
        int shorthandForQuestionNumber = 0;
        for (int questionNumber = reportModel.getMinQuestionNumber();
            questionNumber <= reportModel.getMaxQuestionNumber(); questionNumber++) {
            shorthandForQuestionNumber++;
            if (shorthandForQuestionNumber > 9) {
                shorthandForQuestionNumber = 0;
            }

            sb.append(shorthandForQuestionNumber);
            if (shorthandForQuestionNumber % groupSize == 0) {
                sb.append(oneSpace);
            }
        }

        sb.append(getRightAlignedText(maxTakenAnswersDigestLength, "О"));
        sb.append(oneSpace);
        sb.append(getRightAlignedText(getMaxTeamRatingLength(isMainRound), "Р"));
        sb.append(oneSpace);
        sb.append("КОМАНДА");
        sb.append("\n");

        // формируем тело блока
        int gradeCounter = 0;
        Collection<ResultTableReportModel.ReportRowModel> reportModelRows = getReportModelRows(isMainRound);
        for (ResultTableReportModel.ReportRowModel oneModelRow: reportModelRows) {
            sb.append(getRightAlignedText(maxTeamNumberLength, String.valueOf(oneModelRow.getTeamNumber())));
            sb.append(twoSpaces);

            // выводим + и - в зависимости от того, взят-ли вопрос
            final boolean[] answerFlags = oneModelRow.getAnswerFlags();
            for (boolean answerFlag: answerFlags) {
                String gradeSymbol = answerFlag ? "+" : "-";
                sb.append(gradeSymbol);
                gradeCounter++;

                if (gradeCounter % groupSize == 0) {
                    sb.append(oneSpace);
                }
            }

            // выводим информацию о количестве взятых в предыдущем и текущем турах вопросах
            sb.append(getRightAlignedNumber(maxQuestionNumberLength, oneModelRow.getAmountOfTakenAnswersInThisRound()));
            sb.append(".");
            sb.append(getRightAlignedNumber(maxQuestionNumberLength,
                    oneModelRow.getAmountOfTakenAnswersInPreviousRound()));
            sb.append(oneSpace);
            sb.append(getRightAlignedText(getMaxTeamRatingLength(isMainRound),
                    String.valueOf(oneModelRow.getTeamRating())));

            sb.append(oneSpace);
            sb.append(oneModelRow.getTeamTitle());
            sb.append("\n");
        }

        // строка с рейтингом вопросов
        sb.append("Рейтинг\n");
        // номера вопросов сперва выписываем в строку
        for (int questionNumber = reportModel.getMinQuestionNumber();
            questionNumber <= reportModel.getMaxQuestionNumber(); questionNumber++) {

            sb.append(getRightAlignedText(blockBodyColumnLength, String.valueOf(questionNumber))).append(oneSpace);
        }
        sb.append("\n");

        // на новой строке - рейтинг вопросов
        final Map<Integer, Integer> questionsRatingMap = reportModel.getQuestionsRatingMap(isMainRound);
        for (int questionNumber = reportModel.getMinQuestionNumber();
             questionNumber <= reportModel.getMaxQuestionNumber(); questionNumber++) {

            final int questionRating = questionsRatingMap.get(questionNumber);
            sb.append(getRightAlignedText(blockBodyColumnLength, String.valueOf(questionRating)));
            sb.append(oneSpace);
        }

        sb.append("\n");
        return sb.toString();
    }
}
