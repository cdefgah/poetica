/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.model.config;

import javax.persistence.*;

/**
 * Строка в таблице конфигурации.
 */
@Entity
@Table(name = "CONFIGURATION")
public class ConfigurationRecord {

    /**
     * Уникальный идентификатор записи в настройках.
     */
    @Id
    @GeneratedValue
    private Long id;

    /**
     * Ключ для той или иной настройки.
     */
    @Column(nullable = false)
    private String key;

    /**
     * Значение для той или иной настройки.
     * Для сложных значений применяем JSON.
     */
    @Column(nullable = false)
    private String value;

    /**
     * Конструктор класса.
     */
    public ConfigurationRecord() {
    }

    /**
     * Отдаёт уникальный идентификатор строки в таблице настроек.
     * @return уникальный идентификатор строки в таблице настроек.
     */
    public Long getId() {
        return id;
    }

    /**
     * Отдаёт ключ для строки настроек.
     * @return ключ для строки настроек.
     */
    public String getKey() {
        return key;
    }

    /**
     * Устанавливает ключ для строки настроек.
     * @param key ключ для строки настроек.
     */
    public void setKey(String key) {
        this.key = key;
    }

    /**
     * Отдаёт значение строки настроек.
     * @return значение строки настроек.
     */
    public String getValue() {
        return value;
    }

    /**
     * Устанавливает значение строки настроек.
     * @param value значение строки настроек.
     */
    public void setValue(String value) {
        this.value = value;
    }
}
