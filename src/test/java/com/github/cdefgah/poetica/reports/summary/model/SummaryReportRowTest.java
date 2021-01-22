package com.github.cdefgah.poetica.reports.summary.model;

import com.github.cdefgah.poetica.reports.summary.model.SummaryReportModel.SummaryReportRow;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SummaryReportRowTest {

    @Test
    void testToString() {
        final String teamTitle = "Some team";
        final int emailsCount = 13;
        final String expectedToStringRepresentation = teamTitle + "  [" + emailsCount + "]";

        SummaryReportRow summaryReportRow = new SummaryReportRow(teamTitle, emailsCount);
        assertEquals(expectedToStringRepresentation, summaryReportRow.toString());
    }

    @Test
    void objectsConformToTheMainComparableRules() {

        SummaryReportRow summaryReportRow1 = new SummaryReportRow("ZZZ", 1);
        SummaryReportRow summaryReportRow2 = new SummaryReportRow("ZZZ", 2);
        SummaryReportRow summaryReportRow3 = new SummaryReportRow("AAA", 3);

        assertAll("Validating the conformance to compareTo contract",

                () -> assertEquals(0, summaryReportRow1.compareTo(summaryReportRow2),
                        "Equal comparable objects should return 0 on compareTo() call"),

                () -> assertTrue(summaryReportRow1.compareTo(summaryReportRow3) > 0,
                        "Calling compareTo() of a bigger comparable object " +
                                "with a smaller comparable object as an argument, should return positive integer"),

                () -> assertTrue(summaryReportRow3.compareTo(summaryReportRow1) < 0,
                        "Calling compareTo() of a smaller comparable object " +
                                "with a bigger comparable object as an argument, should return negative integer")
        );
    }

    @SuppressWarnings("ConstantConditions")
    @Test
    void compareWithNull() {
        assertThrows(NullPointerException.class, () -> {
            SummaryReportRow summaryReportRow = new SummaryReportRow("ZZZ", 1);
            summaryReportRow.compareTo(null);
        }, "The class does not conform to the Oracle recommendation for compareTo() " +
                "when there is a null argument passed," +
                "this method should throw NullPointerException, but it does not");
    }

    @Test
    void compareInBothDirections() {
        SummaryReportRow summaryReportRow1 = new SummaryReportRow("ZZZ", 1);
        SummaryReportRow summaryReportRow2 = new SummaryReportRow("AAA", 1);

        // checking for: sgn(x.compareTo(y)) == -sgn(y.compareTo(x))
        assertEquals(Integer.signum(summaryReportRow1.compareTo(summaryReportRow2)),
                -1 * Integer.signum(summaryReportRow2.compareTo(summaryReportRow1)),
                "compareTo() method of comparable objects should work in both directions");
    }

    @Test
    void compareToIsTransitive() {
        SummaryReportRow x = new SummaryReportRow("ZZZ", 1);
        SummaryReportRow y = new SummaryReportRow("MMM", 1);
        SummaryReportRow z = new SummaryReportRow("AAA", 1);

        assertAll("Ensuring that: (x.compareTo(y)>0 && y.compareTo(z)>0) implies x.compareTo(z)>0",
                () -> assertTrue(x.compareTo(y) > 0),
                () -> assertTrue(y.compareTo(z) > 0),
                () -> assertTrue(x.compareTo(z) > 0)
        );
    }

    @Test
    void compareToContractAdditionalRuleIsFulfilled() {
        // x.compareTo(y)==0 implies that sgn(x.compareTo(z)) == sgn(y.compareTo(z)), for all z.
        // (x.compareTo(y)==0) == (x.equals(y)).

        SummaryReportRow x = new SummaryReportRow("AAA", 1);
        SummaryReportRow y = new SummaryReportRow("AAA", 1);
        SummaryReportRow z = new SummaryReportRow("ZZZ", 1);

        assertAll("x.compareTo(y)==0 implies that sgn(x.compareTo(z)) == sgn(y.compareTo(z)), for all z, " +
                        "(x.compareTo(y)==0) == (x.equals(y)).",
                () -> assertEquals(0, x.compareTo(y)),
                () -> assertEquals(Integer.signum(x.compareTo(z)), Integer.signum(y.compareTo(z))),
                () -> assertEquals(x, y)
        );
    }
}