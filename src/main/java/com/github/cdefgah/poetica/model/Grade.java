/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.model;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Оценка ответа.
 */
public enum Grade {
    None("None"), // если оценка вообще не проставлена
    NotAccepted("NotAccepted"), //  если ответ не принят
    Accepted("Accepted"); // если ответ принят

    /**
     * Значение оценки.
     */
    private final String gradeValue;

    /**
     * Для конверсии строки с символом оценки в значение enum.
     */
    private static final Map<String, Grade> stringToEnum = new HashMap<>();

    static {
        // инициализируем таблицу
        for (Grade grade : values()) {
            stringToEnum.put(grade.toString(), grade);
        }
    }

    /**
     * Конструктор.
     * @param gradeValue строковое значение оценки.
     */
    Grade(String gradeValue) {
        this.gradeValue = gradeValue;
    }

    /**
     * Формирует значение enum из строки с символом оценки.
     * @param gradeValue строка c оценкой.
     * @return Optional со значением enum, если конверсия успешна,
     * иначе возвращает Optional.empty().
     */
    public static Optional<Grade> fromGradeValue(final String gradeValue) {
        if (stringToEnum.containsKey(gradeValue)) {
            return Optional.of(stringToEnum.get(gradeValue));
        } else {
            return Optional.empty();
        }
    }

    /**
     * Возвращает строковое представление значения enum.
     * @return символ оценки.
     */
    @Override
    public String toString() {
        return this.gradeValue;
    }
}