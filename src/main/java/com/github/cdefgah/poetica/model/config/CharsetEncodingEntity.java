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
