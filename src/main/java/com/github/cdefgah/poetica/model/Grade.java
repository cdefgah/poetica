package com.github.cdefgah.poetica.model;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Оценка ответа.
 */
public enum Grade {
    None("?"), // если оценка вообще не проставлена
    NotAccepted("-"), //  если ответ не принят
    Accepted("+"); // если ответ принят

    /**
     * Символ оценки.
     */
    private final String gradeSymbol;

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
     * @param gradeSymbol символ с оценкой.
     */
    Grade(String gradeSymbol) {
        this.gradeSymbol = gradeSymbol;
    }

    /**
     * Формирует значение enum из строки с символом оценки.
     * @param gradeSymbol строка с символом оценки.
     * @return Optional со значением enum, если конверсия успешна,
     * иначе возвращает Optional.empty().
     */
    public static Optional<Grade> fromGradeSymbol(final String gradeSymbol) {
        if (stringToEnum.containsKey(gradeSymbol)) {
            return Optional.of(stringToEnum.get(gradeSymbol));
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
        return this.gradeSymbol;
    }
}