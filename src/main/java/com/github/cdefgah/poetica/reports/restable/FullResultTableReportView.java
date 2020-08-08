package com.github.cdefgah.poetica.reports.restable;

import com.github.cdefgah.poetica.reports.restable.ResultTableReportModel;

public class FullResultTableReportView {

    private ResultTableReportModel reportModel;

    public FullResultTableReportView(ResultTableReportModel reportModel) {
        this.reportModel = reportModel;
    }

    public String getReportText() {
        final StringBuilder sb = new StringBuilder();
        sb.append("ЗАЧЁТ  Предварительный");
        sb.append(getRoundBlockText(false));
        sb.append("\n\n");
        sb.append("ЗАЧЁТ  Основной");
        sb.append(getRoundBlockText(true));
        return sb.toString();
    }

    private String getRoundBlockText(boolean isMainRound) {
        final StringBuilder sb = new StringBuilder();



        return sb.toString();
    }
}
