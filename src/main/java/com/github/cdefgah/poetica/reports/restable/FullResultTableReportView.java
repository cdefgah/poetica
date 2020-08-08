package com.github.cdefgah.poetica.reports.restable;

import com.github.cdefgah.poetica.reports.restable.model.ResultTableReportModel;

import java.util.Collection;

public class FullResultTableReportView extends AbstractResultTableReportView {


    public FullResultTableReportView(ResultTableReportModel reportModel) {
        super(reportModel);
        this.reportModel = reportModel;
    }

    public String getReportText() {
        final StringBuilder sb = new StringBuilder();
        sb.append(getRoundBlockText(false));
        sb.append("\n\n");
        sb.append(getRoundBlockText(true));
        return sb.toString();
    }

    private String getRoundBlockText(boolean isMainRound) {
        final String oneSpace = " ";
        final StringBuilder sb = new StringBuilder();
        sb.append(getBlockTitle(isMainRound)).append("\n");
        sb.append(getRightAlignedText(maxTeamNumberLength, "N")).append(oneSpace);
        for (int questionNumber = reportModel.getMinQuestionNumber();
                                             questionNumber <= reportModel.getMaxQuestionNumber(); questionNumber++) {

            sb.append(getRightAlignedText(maxQuestionNumberLength, String.valueOf(questionNumber))).append(oneSpace);
        }
        sb.append(oneSpace);
        sb.append(getRightAlignedText(maxTakenAnswersDigestLength, "О"));
        sb.append(oneSpace);
        sb.append(getRightAlignedText(getMaxTeamRatingLength(isMainRound), "Р"));
        sb.append(oneSpace);
        sb.append("КОМАНДА");
        sb.append("\n");

        Collection<ResultTableReportModel.ReportRowModel>  reportModelRows = getReportModelRows(isMainRound);
        for (ResultTableReportModel.ReportRowModel oneModelRow: reportModelRows) {
            sb.append(getRightAlignedText(maxTeamNumberLength, String.valueOf(oneModelRow.getTeamNumber())));

            // форматировать + или - в зависимости от длины номера задания (right align)
            for ()
        }

        return sb.toString();
    }
}
