/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.model.config;

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