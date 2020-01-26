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
}