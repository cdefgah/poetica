/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.reports.collection.model.comparators;

import com.github.cdefgah.poetica.model.Answer;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class QuestionNumberAndAnswerBodyComparatorTest {

    @Test
    void testCompareEqualQuestionNumbersAndSameBodies() {

        final int questionNumber = 1;
        final String answerBody = "abc\nxyz";

        Answer answer1 = new Answer();
        Answer answer2 = new Answer();

        answer1.setQuestionNumber(questionNumber);
        answer2.setQuestionNumber(questionNumber);

        answer1.setBody(answerBody);
        answer2.setBody(answerBody);

        QuestionNumberAndAnswerBodyComparator comparator = new QuestionNumberAndAnswerBodyComparator();

        assertEquals(0, comparator.compare(answer1, answer2));
    }


    @Test
    void testCompareEqualQuestionNumbersAndFirstBodyIsLessThanSecondBody() {

        final int questionNumber = 1;
        final String firstAnswerBody = "abc\nxyz";
        final String secondAnswerBody = "xyz\nabc";

        Answer answer1 = new Answer();
        Answer answer2 = new Answer();

        answer1.setQuestionNumber(questionNumber);
        answer2.setQuestionNumber(questionNumber);

        answer1.setBody(firstAnswerBody);
        answer2.setBody(secondAnswerBody);

        QuestionNumberAndAnswerBodyComparator comparator = new QuestionNumberAndAnswerBodyComparator();

        assertTrue(comparator.compare(answer1, answer2) < 0);
    }

    @Test
    void testCompareEqualQuestionNumbersAndFirstBodyIsGreaterThanSecondBody() {

        final int questionNumber = 1;
        final String firstAnswerBody = "xyz\nabc";
        final String secondAnswerBody = "abc\nxyz";

        Answer answer1 = new Answer();
        Answer answer2 = new Answer();

        answer1.setQuestionNumber(questionNumber);
        answer2.setQuestionNumber(questionNumber);

        answer1.setBody(firstAnswerBody);
        answer2.setBody(secondAnswerBody);

        QuestionNumberAndAnswerBodyComparator comparator = new QuestionNumberAndAnswerBodyComparator();

        assertTrue(comparator.compare(answer1, answer2) > 0);
    }

    @Test
    void testCompareDifferentQuestionNumbersWithSameAnswers() {

        final int questionNumber1 = 1;
        final int questionNumber2 = 2;
        final int questionNumber3 = 3;

        final String answerBody = "xyz\nabc";

        Answer answer1 = new Answer();
        Answer answer2 = new Answer();
        Answer answer3 = new Answer();

        answer1.setQuestionNumber(questionNumber1);
        answer2.setQuestionNumber(questionNumber2);
        answer3.setQuestionNumber(questionNumber3);

        answer1.setBody(answerBody);
        answer2.setBody(answerBody);
        answer3.setBody(answerBody);

        QuestionNumberAndAnswerBodyComparator comparator = new QuestionNumberAndAnswerBodyComparator();

        assertTrue(comparator.compare(answer3, answer2) > 0);
        assertTrue(comparator.compare(answer2, answer1) > 0);
        assertTrue(comparator.compare(answer3, answer1) > 0);

        assertTrue(comparator.compare(answer2, answer3) < 0);
        assertTrue(comparator.compare(answer1, answer2) < 0);
        assertTrue(comparator.compare(answer1, answer3) < 0);
    }

    @Test
    void testCompareDifferentQuestionNumbersWithDifferentAnswers() {

        final int questionNumber1 = 1;
        final int questionNumber2 = 2;
        final int questionNumber3 = 3;

        final String firstAnswerBody = "xyz\nabc";
        final String secondAnswerBody = "abc\nxyz";
        final String thirdAnswerBody = "klm\npqr\nstu";

        Answer answer1 = new Answer();
        Answer answer2 = new Answer();
        Answer answer3 = new Answer();

        answer1.setQuestionNumber(questionNumber1);
        answer2.setQuestionNumber(questionNumber2);
        answer3.setQuestionNumber(questionNumber3);

        answer1.setBody(firstAnswerBody);
        answer2.setBody(secondAnswerBody);
        answer2.setBody(thirdAnswerBody);

        QuestionNumberAndAnswerBodyComparator comparator = new QuestionNumberAndAnswerBodyComparator();

        assertTrue(comparator.compare(answer3, answer2) > 0);
        assertTrue(comparator.compare(answer2, answer1) > 0);
        assertTrue(comparator.compare(answer3, answer1) > 0);

        assertTrue(comparator.compare(answer2, answer3) < 0);
        assertTrue(comparator.compare(answer1, answer2) < 0);
        assertTrue(comparator.compare(answer1, answer3) < 0);
    }
}