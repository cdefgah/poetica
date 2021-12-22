/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.model.config;

import java.util.HashMap;
import java.util.Map;

/**
 * Конфигурация приложения. Пока практически не используется.
 * Класс сделан на вырост, когда в системе будет много настроек.
 */
public class Configuration {

    public static final String CONFIG_KEY_GRADED_QUESTION_BACKGROUND_COLOR = "configKeyGradedQuestionBackgroundColor";
    public static final String CONFIG_KEY_NON_GRADED_QUESTION_BACKGROUND_COLOR =
                                                                           "configKeyNonGradedQuestionBackgroundColor";


    /**
     * Список поддерживаемых приложением кодировок для формирования отчётов.
     */
    public static final CharsetEncodingEntity[] SUPPORTED_ENCODINGS = {
            new CharsetEncodingEntity("Юникод (Unicode)", "UTF8"),
            new CharsetEncodingEntity("КОИ-8Р (KOI-8R)", "KOI8_R")
    };

    /**
     * Набор ключ-значение для всех настроек.
     */
    private Map<String, ConfigurationRecord> allConfigurationRecordsMap = new HashMap<>();

    /**
     * Конструктор класса.
     */
    public Configuration() {

    }
}
