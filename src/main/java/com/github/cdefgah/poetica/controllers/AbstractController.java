package com.github.cdefgah.poetica.controllers;

abstract class AbstractController {

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
}