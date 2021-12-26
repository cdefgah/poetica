/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.persistence.Query;
import java.util.HashMap;
import java.util.Map;

import com.github.cdefgah.poetica.model.config.*;
import com.github.cdefgah.poetica.model.repositories.ConfigurationRepository;

/**
 * Отвечает за управление настройками программы.
 */
@RestController
@Transactional
public class ConfigurationController extends AbstractController {

    /**
     * Конфигурация программы.
     */
    @Autowired
    private Configuration configuration;

    /**
     * Репозиторий конфигурационных записей.
     */
    @Autowired
    private ConfigurationRepository repository;

    /**
     * Отдаёт по запросу перечень поддерживаемых кодировок символов.
     * @return массив с именами поддерживаемых кодировок символов.
     */
    @RequestMapping(path = "/configuration/supported-report-encodings",
            method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<CharsetEncodingEntity[]> getSupportedReportEncodings() {
        return new ResponseEntity<>(Configuration.SUPPORTED_ENCODINGS, HttpStatus.OK);
    }

    /**
     * Обновляет значение в конфигурации.
     * @param configKey ключ для обновления.
     * @param configValue новое значение.
     * @return Если всё в порядке, ничего не возвращает кроме HTTP.OK.
     */
    @RequestMapping(path = "/configuration/updateConfig/{configKey}",
                                                            method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<String> updateConfiguration(@PathVariable String configKey,
                                                                    @RequestParam("configValue") String configValue) {
        updateConfigRecord(configKey, configValue);
        return ResponseEntity.ok().build();
    }

    /**
     * Отдаёт по запросу цвета фона для строк таблицы вопросов.
     * @return словарь (map) с цветами фона для строк таблицы вопросов.
     */
    @RequestMapping(path = "/configuration/colors-for-questions",
            method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Map<String,String >> getColorsForQuestionsTable() {
        ConfigurationRecord gradedQuestionBackgroundColor = entityManager.find(ConfigurationRecord.class,
                                                            Configuration.CONFIG_KEY_GRADED_QUESTION_BACKGROUND_COLOR);
        ConfigurationRecord nonGradedQuestionBackgroundColor = entityManager.find(ConfigurationRecord.class,
                Configuration.CONFIG_KEY_NON_GRADED_QUESTION_BACKGROUND_COLOR);
        Map<String,String> resultMap = new HashMap<>();
        resultMap.put(gradedQuestionBackgroundColor.getKey(), gradedQuestionBackgroundColor.getValue());
        resultMap.put(nonGradedQuestionBackgroundColor.getKey(), nonGradedQuestionBackgroundColor.getValue());

        return new ResponseEntity<>(resultMap, HttpStatus.OK);
    }

    /**
     * Отдаёт по запросу цвета фона для строк таблицы ответов.
     * @return словарь (map) с цветами фона для строк таблицы ответов.
     */
    @RequestMapping(path = "/configuration/colors-for-answers",
            method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Map<String,String >> getColorsForAnswersTable() {

        ConfigurationRecord acceptedAnswerBackgroundColor = entityManager.find(ConfigurationRecord.class,
                                                    Configuration.CONFIG_KEY_BACKGROUND_COLOR_FOR_ACCEPTED_ANSWER);

        ConfigurationRecord notAcceptedAnswerBackgroundColor = entityManager.find(ConfigurationRecord.class,
                                                   Configuration.CONFIG_KEY_BACKGROUND_COLOR_FOR_NOT_ACCEPTED_ANSWER);

        ConfigurationRecord notGradedAnswerBackgroundColor = entityManager.find(ConfigurationRecord.class,
                                                     Configuration.CONFIG_KEY_BACKGROUND_COLOR_FOR_NOT_GRADED_ANSWER);


        Map<String,String> resultMap = new HashMap<>();
        resultMap.put(acceptedAnswerBackgroundColor.getKey(), acceptedAnswerBackgroundColor.getValue());
        resultMap.put(notAcceptedAnswerBackgroundColor.getKey(), notAcceptedAnswerBackgroundColor.getValue());
        resultMap.put(notGradedAnswerBackgroundColor.getKey(), notGradedAnswerBackgroundColor.getValue());

        return new ResponseEntity<>(resultMap, HttpStatus.OK);
    }

    /**
     * Сбрасывает настройки цвета в цвета по-умолчанию для таблицы с вопросами.
     */
    @RequestMapping(path = "/configuration/reset-colors-for-questions",
            method = RequestMethod.POST, produces = "text/plain")
    public ResponseEntity<String> resetQuestionPageColors() {
        // получаем значения по-умолчанию для цветов
        ConfigurationRecord defaultGradedQuestionBackgroundColor = entityManager.find(ConfigurationRecord.class,
                            Configuration.getDefaultKeyName(Configuration.CONFIG_KEY_GRADED_QUESTION_BACKGROUND_COLOR));

        ConfigurationRecord defaultNonGradedQuestionBackgroundColor = entityManager.find(ConfigurationRecord.class,
                        Configuration.getDefaultKeyName(Configuration.CONFIG_KEY_NON_GRADED_QUESTION_BACKGROUND_COLOR));

        // полученные значения гарантированно не равны null, поэтому проверку тут не делаем
        updateConfigRecord(Configuration.CONFIG_KEY_GRADED_QUESTION_BACKGROUND_COLOR,
                                                                       defaultGradedQuestionBackgroundColor.getValue());

        updateConfigRecord(Configuration.CONFIG_KEY_NON_GRADED_QUESTION_BACKGROUND_COLOR,
                                                                    defaultNonGradedQuestionBackgroundColor.getValue());

        return new ResponseEntity<>("", HttpStatus.OK);
    }

    /**
     * Сбрасывает настройки цвета в цвета по-умолчанию для таблицы с ответами.
     */
    @RequestMapping(path = "/configuration/reset-colors-for-answers",
            method = RequestMethod.POST, produces = "text/plain")
    public ResponseEntity<String> resetAnswersPageColors() {
        // получаем значения по-умолчанию для цветов

        ConfigurationRecord defaultBackgroundColorForAcceptedAnswer =
                entityManager.find(ConfigurationRecord.class,
                        Configuration.getDefaultKeyName(Configuration.CONFIG_KEY_BACKGROUND_COLOR_FOR_ACCEPTED_ANSWER));

        ConfigurationRecord defaultBackgroundColorForNotAcceptedAnswer =
                entityManager.find(ConfigurationRecord.class,
                    Configuration.getDefaultKeyName(Configuration.CONFIG_KEY_BACKGROUND_COLOR_FOR_NOT_ACCEPTED_ANSWER));

        ConfigurationRecord defaultBackgroundColorForNotGradedAnswer =
                entityManager.find(ConfigurationRecord.class,
                      Configuration.getDefaultKeyName(Configuration.CONFIG_KEY_BACKGROUND_COLOR_FOR_NOT_GRADED_ANSWER));


        updateConfigRecord(Configuration.CONFIG_KEY_BACKGROUND_COLOR_FOR_ACCEPTED_ANSWER,
                                                                    defaultBackgroundColorForAcceptedAnswer.getValue());

        updateConfigRecord(Configuration.CONFIG_KEY_BACKGROUND_COLOR_FOR_NOT_ACCEPTED_ANSWER,
                                                                 defaultBackgroundColorForNotAcceptedAnswer.getValue());

        updateConfigRecord(Configuration.CONFIG_KEY_BACKGROUND_COLOR_FOR_NOT_GRADED_ANSWER,
                                                                   defaultBackgroundColorForNotGradedAnswer.getValue());
        return new ResponseEntity<>("", HttpStatus.OK);
    }

    /**
     * Сбрасывает настройки цвета в цвета по-умолчанию для таблицы с вопросами.
     */
    @RequestMapping(path = "/configuration/reset-database-state",
            method = RequestMethod.POST, produces = "text/plain")
    public ResponseEntity<String> resetDatabaseStateForTheNextRound() {
        Query answersDeletionQuery = entityManager.createQuery("delete from Answer answer");
        Query emailsDeletionQuery = entityManager.createQuery("delete from Email email");

        answersDeletionQuery.executeUpdate();
        emailsDeletionQuery.executeUpdate();

        return new ResponseEntity<>("", HttpStatus.OK);
    }

    /**
     * Обновляет значение настроек.
     * @param key ключ для значения.
     * @param value новое значение.
     */
    private void updateConfigRecord(String key, String value) {
        ConfigurationRecord configurationRecord = repository.getOne(key);
        configurationRecord.setValue(value);
        repository.save(configurationRecord);
    }
}