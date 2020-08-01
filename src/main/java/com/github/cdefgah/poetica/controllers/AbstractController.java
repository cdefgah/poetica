package com.github.cdefgah.poetica.controllers;

import org.springframework.http.HttpHeaders;

import java.text.SimpleDateFormat;
import java.util.Date;

abstract class AbstractController {

    private static final SimpleDateFormat fileNamePrefixDateFormat = new SimpleDateFormat("yyyyMMdd-HHMM-");

    /**
     * Проверяет, если строка пустая, возвращает true.
     * @param string строка для проверки.
     * @return true, если строка пустая или состоит из пробелов.
     */
    protected static boolean isStringEmpty(String string) {
        return string == null || string.trim().isEmpty();
    }

    /**
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

    protected String getTimestampPrefixForFileName() {
        return fileNamePrefixDateFormat.format(new Date());
    }
}