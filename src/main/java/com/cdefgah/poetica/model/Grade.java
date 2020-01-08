package com.cdefgah.poetica.model;

public enum Grade {
    NotAccepted("-"),
    Accepted("+"),
    Uncertain("?");

    private final String gradeSymbol;

    Grade(String gradeSymbol) {
        this.gradeSymbol = gradeSymbol;
    }

    public String getGradeSymbol() {
        return gradeSymbol;
    }

    public static Grade fromGradeSymbol(final String gradeSymbol) {
        switch (gradeSymbol) {
            case "-":
                return NotAccepted;

            case "+":
                return Accepted;

            case "?":
                return Uncertain;

            default:
                throw new IllegalArgumentException("Unexpected grade symbol: " + gradeSymbol);
        }
    }

    @Override
    public String toString() {
        return this.gradeSymbol;
    }
}