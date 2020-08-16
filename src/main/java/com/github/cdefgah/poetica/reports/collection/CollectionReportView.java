package com.github.cdefgah.poetica.reports.collection;

import com.github.cdefgah.poetica.reports.collection.model.CollectionReportModel;

import java.util.Map;

public class CollectionReportView {

    private final CollectionReportModel reportModel;

    public CollectionReportView(CollectionReportModel reportModel) {
        this.reportModel = reportModel;
    }

    public String getReportText() {
        return "";
    }
}
