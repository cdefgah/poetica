/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.controllers;

import com.github.cdefgah.poetica.model.config.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;


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
     * Отдаёт по запросу перечень поддерживаемых кодировок символов.
     * @return массив с именами поддерживаемых кодировок символов.
     */
    @RequestMapping(path = "/configuration/supported-report-encodings",
            method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<CharsetEncodingEntity[]> getSupportedReportEncodings() {
        return new ResponseEntity<>(Configuration.SUPPORTED_ENCODINGS, HttpStatus.OK);
    }

    @RequestMapping(path = "/configuration/colors-for-questions",
            method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Map<String,ConfigurationRecord >> getColorsForQuestionsPage() {

        // return new ResponseEntity<>(Configuration.SUPPORTED_ENCODINGS, HttpStatus.OK);
        return null;
    }

    /**
     * Сбрасывает настройки цвета в цвета по-умолчанию для таблицы с вопросами.
     */
    @RequestMapping(path = "/configuration/reset-colors-for-questions",
            method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<String> resetQuestionPageColors() {

        // return new ResponseEntity<>(Configuration.SUPPORTED_ENCODINGS, HttpStatus.OK);
        return new ResponseEntity<>("", HttpStatus.OK);
    }
}