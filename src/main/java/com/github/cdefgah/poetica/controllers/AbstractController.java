/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;

import javax.persistence.EntityManager;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Прототип для всех REST-контроллеров.
 */
abstract class AbstractController {

    /**
     * Для формирования строки с датой и временем в именах сгенерированных файлов.
     */
    @SuppressWarnings("SpellCheckingInspection")
    private static final SimpleDateFormat fileNameTimeStampDateFormat = new SimpleDateFormat("yyyyMMdd-HHmmss");

    /**
     * Менеджер сущностей для взаимодействия с базой данных.
     */
    @Autowired
    EntityManager entityManager;

    /**
     * Проверяет, если строка пустая, возвращает true.
     * @param string строка для проверки.
     * @return true, если строка пустая или состоит из пробелов.
     */
    protected static boolean isStringEmpty(String string) {
        return string == null || string.trim().isEmpty();
    }

    /**
     * TODO - переделать этот механизм, он костыльный и неправильный.
     * Формирует сообщение об ошибке с префиксом, чтобы на клиенте отличать сообщения об ошибках штатные,
     * и сообщения об ошибках нештатные.
     * @param rawErrorMessage исходное сообщение об ошибке.
     * @return сообщение об ошибке с префиксом.
     */
    protected static String composeErrorMessage(String rawErrorMessage) {
        return "Внимание: " + rawErrorMessage;
    }

    /**
     * Формирует HTTP заголовки для выгрузки файла.
     * @param fileNameWithExtension имя файла с расширением, которое будет выгружаться.
     * @return HTTP заголовки.
     */
    protected HttpHeaders getHttpHeaderForGeneratedFile(String fileNameWithExtension) {
        HttpHeaders header = new HttpHeaders();
        header.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileNameWithExtension + "\"");
        header.add("Cache-Control", "no-cache, no-store, must-revalidate");
        header.add("Pragma", "no-cache");
        header.add("Expires", "0");

        return header;
    }

    /**
     * Формирует строку с датой и временем, которая будет испрользоваться как часть имени сгенерированного файла.
     * @return строка с датой и временем, для формирования имени сгенерированных файлов.
     */
    protected String getTimeStampPartForFileName() {
        return fileNameTimeStampDateFormat.format(new Date());
    }
}