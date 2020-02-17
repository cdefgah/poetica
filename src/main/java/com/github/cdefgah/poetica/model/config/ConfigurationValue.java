package com.github.cdefgah.poetica.model.config;

public final class ConfigurationValue {

    private final String value;

    public ConfigurationValue(int value) {
        this.value = String.valueOf(value);
    }

    public ConfigurationValue(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}