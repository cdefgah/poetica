package com.cdefgah.poetica.model;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public enum Grade {
    None("N"),
    NotAccepted("-"),
    Accepted("+"),
    Uncertain("?");

    private final String gradeSymbol;

    private static final Map<String, Grade> stringToEnum = new HashMap<>();

    static {
        for (Grade grade : values())
            stringToEnum.put(grade.toString(), grade);
    }

    Grade(String gradeSymbol) {
        this.gradeSymbol = gradeSymbol;
    }

    public static Optional<Grade> fromGradeSymbol(final String gradeSymbol) {
        if (stringToEnum.containsKey(gradeSymbol)) {
            return Optional.of(stringToEnum.get(gradeSymbol));
        } else {
            return Optional.empty();
        }
    }

    @Override
    public String toString() {
        return this.gradeSymbol;
    }
}