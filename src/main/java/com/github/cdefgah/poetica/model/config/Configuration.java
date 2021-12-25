/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.model.config;

/**
 * Конфигурация приложения. Пока практически не используется.
 * Класс сделан на вырост, когда в системе будет много настроек.
 */
public class Configuration {

    public static final String CONFIG_KEY_GRADED_QUESTION_BACKGROUND_COLOR = "configKeyGradedQuestionBackgroundColor";
    public static final String CONFIG_KEY_NON_GRADED_QUESTION_BACKGROUND_COLOR =
                                                                           "configKeyNonGradedQuestionBackgroundColor";

    public static final String CONFIG_KEY_BACKGROUND_COLOR_FOR_ACCEPTED_ANSWER =
                                                                            "configKeyBackgroundColorForAcceptedAnswer";
    public static final String CONFIG_KEY_BACKGROUND_COLOR_FOR_NOT_ACCEPTED_ANSWER =
                                                                        "configKeyBackgroundColorForNotAcceptedAnswer";

    public static final String CONFIG_KEY_BACKGROUND_COLOR_FOR_NOT_GRADED_ANSWER =
                                                                           "configKeyBackgroundColorForNotGradedAnswer";

    /**
     * Список поддерживаемых приложением кодировок для формирования отчётов.
     */
    public static final CharsetEncodingEntity[] SUPPORTED_ENCODINGS = {
            new CharsetEncodingEntity("Юникод (Unicode)", "UTF8"),
            new CharsetEncodingEntity("КОИ-8Р (KOI-8R)", "KOI8_R")
    };

    /**
     * Отдаёт название ключа для дефолтного значения настроек.
     * @param configKeyName ключ значения, для которого нам нужно имя дефолтного ключа.
     * @return название ключа для дефолтного значения настроек.
     */
    public static String getDefaultKeyName(String configKeyName) {
        return "default_" + configKeyName;
    }

    /**
     * Конструктор класса.
     */
    public Configuration() {

    }
}
