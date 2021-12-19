/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.model.config;

/**
 * Представляет собой сущность с информацией о кодировке.
 */
public final class CharsetEncodingEntity {

    /**
     * Название кодировки, отображаемое для пользователя.
     */
    private final String humanReadableTitle;

    /**
     * Системное название кодировки.
     */
    private final String systemName;

    /**
     * Конструктор класса.
     * @param humanReadableTitle название кодировки для отображения в пользовтельском интерфейсе.
     * @param systemName системное название кодировки.
     */
    public CharsetEncodingEntity(String humanReadableTitle, String systemName) {
        this.humanReadableTitle = humanReadableTitle;
        this.systemName = systemName;
    }

    /**
     * Отдаёт название кодировки для отображения в пользовательском интерфейсе.
     * @return название кодировки для отображения в пользовательском интерфейсе.
     */
    public String getHumanReadableTitle() {
        return humanReadableTitle;
    }

    /**
     * Отдаёт системное наименование кодировки.
     * @return системное название кодировки.
     */
    public String getSystemName() {
        return systemName;
    }
}
