package com.github.cdefgah.poetica.model.config;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "CONFIGURATION")
public class ConfigurationRecord {

    @Id
    @GeneratedValue
    private Long id;

    private String key;

    private String value;

    public ConfigurationRecord() {
    }

    public Long getId() {
        return id;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
