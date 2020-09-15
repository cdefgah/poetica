/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.model.config;

/**
 * Конфигурация приложения. Пока практически не используется. Сделана на вырост.
 * Когда в приложении будет много разных настроек.
 */
public class Configuration {

    /**
     * Список поддерживаемых приложением кодировок для формирования отчётов.
     */
    public static final CharsetEncodingEntity[] SUPPORTED_ENCODINGS = {
            new CharsetEncodingEntity("Юникод (Unicode)", "UTF8"),
            new CharsetEncodingEntity("КОИ-8Р (KOI-8R)", "KOI8_R")
    };

    /**
     * Конструктор класса.
     */
    public Configuration() {

    }
}
