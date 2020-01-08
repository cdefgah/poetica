package com.cdefgah.poetica.controllers;

abstract class AbstractController {
    protected static boolean isStringEmpty(String string) {
        return string == null || string.trim().isEmpty();
    }
}