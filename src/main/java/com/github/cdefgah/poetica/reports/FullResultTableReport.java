package com.github.cdefgah.poetica.reports;

public class FullResultTableReport extends  AbstractResultTableReport {

    public FullResultTableReport() {
        super();
    }

    public String getFileNamePart() {
        return "ResultsTable_Full_";
    }

    public String getReportText() {
        return "";
    }
}
