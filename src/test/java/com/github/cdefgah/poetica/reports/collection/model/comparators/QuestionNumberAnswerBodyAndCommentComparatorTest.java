/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.reports.collection.model.comparators;

import com.github.cdefgah.poetica.model.Answer;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class QuestionNumberAnswerBodyAndCommentComparatorTest {

    @Test
    void testCompareEqualQuestionNumbersSameBodiesAndSameComments() {

        final int questionNumber = 1;
        final String answerBody = "abc\nxyz";
        final String answerComment = "mno\npqr\nstu";

        Answer answer1 = new Answer();
        Answer answer2 = new Answer();

        answer1.setQuestionNumber(questionNumber);
        answer2.setQuestionNumber(questionNumber);

        answer1.setBody(answerBody);
        answer1.setComment(answerComment);

        answer2.setBody(answerBody);
        answer2.setComment(answerComment);

        QuestionNumberAnswerBodyAndCommentComparator comparator = new QuestionNumberAnswerBodyAndCommentComparator();
        assertEquals(0, comparator.compare(answer1, answer2));
    }

    @Test
    void testCompareEqualQuestionNumbersSameBodiesAndDifferentComments() {

        final int questionNumber = 1;
        final String answerBody = "abc\nxyz";

        final String firstAnswerComment = "aaa\nbbb\nccc";
        final String secondAnswerComment = "ddd\neee";
        final String thirdAnswerComment = "fff";

        Answer answer1 = new Answer();
        Answer answer2 = new Answer();
        Answer answer3 = new Answer();

        answer1.setQuestionNumber(questionNumber);
        answer2.setQuestionNumber(questionNumber);
        answer3.setQuestionNumber(questionNumber);

        answer1.setBody(answerBody);
        answer1.setComment(firstAnswerComment);

        answer2.setBody(answerBody);
        answer2.setComment(secondAnswerComment);

        answer3.setBody(answerBody);
        answer3.setComment(thirdAnswerComment);

        QuestionNumberAnswerBodyAndCommentComparator comparator = new QuestionNumberAnswerBodyAndCommentComparator();

        assertTrue(comparator.compare(answer3, answer2) > 0);
        assertTrue(comparator.compare(answer2, answer1) > 0);
        assertTrue(comparator.compare(answer3, answer1) > 0);

        assertTrue(comparator.compare(answer2, answer3) < 0);
        assertTrue(comparator.compare(answer1, answer2) < 0);
        assertTrue(comparator.compare(answer1, answer3) < 0);
    }

    @Test
    void testCompareEqualQuestionNumbersDifferentBodiesAndDifferentComments() {

        final int questionNumber = 1;

        final String firstAnswerBody = "zzz";
        final String secondAnswerBody = "xxx";
        final String thirdAnswerBody = "yyy";

        final String firstAnswerComment = "aaa\nbbb\nccc";
        final String secondAnswerComment = "ddd\neee";
        final String thirdAnswerComment = "fff";

        Answer answer1 = new Answer();
        Answer answer2 = new Answer();
        Answer answer3 = new Answer();

        answer1.setQuestionNumber(questionNumber);
        answer2.setQuestionNumber(questionNumber);
        answer3.setQuestionNumber(questionNumber);

        answer1.setBody(firstAnswerBody);
        answer1.setComment(firstAnswerComment);

        answer2.setBody(secondAnswerBody);
        answer2.setComment(secondAnswerComment);

        answer3.setBody(thirdAnswerBody);
        answer3.setComment(thirdAnswerComment);

        QuestionNumberAnswerBodyAndCommentComparator comparator = new QuestionNumberAnswerBodyAndCommentComparator();

        assertTrue(comparator.compare(answer3, answer2) > 0);
        assertTrue(comparator.compare(answer1, answer2) > 0);
        assertTrue(comparator.compare(answer1, answer3) > 0);

        assertTrue(comparator.compare(answer2, answer3) < 0);
        assertTrue(comparator.compare(answer3, answer1) < 0);
        assertTrue(comparator.compare(answer2, answer1) < 0);
    }
}