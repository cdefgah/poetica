/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.model.config;

public final class CharsetEncodingEntity {
    private String humanReadableTitle;
    private String systemName;

    public CharsetEncodingEntity(String humanReadableTitle, String systemName) {
        this.humanReadableTitle = humanReadableTitle;
        this.systemName = systemName;
    }

    public String getHumanReadableTitle() {
        return humanReadableTitle;
    }

    public String getSystemName() {
        return systemName;
    }
}
