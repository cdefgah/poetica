package com.github.cdefgah.poetica.model;

public enum ConfigurationKeys {
    CREDITED_QUESTIONS_QTY("creditedQuestionsQty"),
    REPORTS_ENCODING("reportsEncoding");

    private final String keyName;

    ConfigurationKeys(String keyName) {
        this.keyName = keyName;
    }

    public String getKeyName() {
        return keyName;
    }
}