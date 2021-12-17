/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class AnswerTest {
    @Test
    public void getBodyWithExistingCommentTest() {
        final String BODY_FOR_ANSWER = "Некий ответ для объекта answer";
        final String COMMENT_FOR_ANSWER = "Комментарий для ответа, который относится к объекту answer";
        final String EXPECTED_RESULT = BODY_FOR_ANSWER + " % " +COMMENT_FOR_ANSWER;

        Answer answer = new Answer();
        answer.setBody(BODY_FOR_ANSWER);
        answer.setComment(COMMENT_FOR_ANSWER);

        assertThat(answer.getBodyWithComment()).isEqualTo(EXPECTED_RESULT);
    }

    @Test
    public void getBodyWithEmptyCommentTest() {
        final String BODY_FOR_ANSWER = "Некий ответ для объекта answer";

        Answer answer = new Answer();
        answer.setBody(BODY_FOR_ANSWER);
        answer.setComment("");

        assertThat(answer.getBodyWithComment()).isEqualTo(BODY_FOR_ANSWER);
    }

    @Test
    public void getBodyWithNullCommentTest() {
        final String BODY_FOR_ANSWER = "Некий ответ для объекта answer";

        Answer answer = new Answer();
        answer.setBody(BODY_FOR_ANSWER);

        assertThat(answer.getBodyWithComment()).isEqualTo(BODY_FOR_ANSWER);
    }

    @Test
    public void answerBodyHashEqualityTest() {

        final String BODY_FOR_ANSWER1 = "Некий ответ для объекта answer";
        final String BODY_FOR_ANSWER2 = "Некий ответ     для\t\t объекта \tanswer";
        final String BODY_FOR_ANSWER3 = "Некий\n ответ     для\t\t объекта \tanswer";
        final String BODY_FOR_ANSWER4 = "\n\n\nНекий\n ответ     для\t\t объекта  \n  \tanswer";

        Answer answer1 = new Answer();
        answer1.setBody(BODY_FOR_ANSWER1);

        Answer answer2 = new Answer();
        answer1.setBody(BODY_FOR_ANSWER2);

        Answer answer3 = new Answer();
        answer1.setBody(BODY_FOR_ANSWER3);

        Answer answer4 = new Answer();
        answer1.setBody(BODY_FOR_ANSWER4);

        final String expectedHashCode = "55e75e5d01edc3f3c62fa038857dc716a6acb236842b3fae5456dbfb5c756bc2a8610bb654551ce29b2ffb48e8dcf90f6983c541a015b3595fda01359ff92a0c";

        assertThat(answer1.getAnswerBodyHash()).isEqualTo(expectedHashCode);
        assertThat(answer2.getAnswerBodyHash()).isEqualTo(expectedHashCode);
        assertThat(answer3.getAnswerBodyHash()).isEqualTo(expectedHashCode);
        assertThat(answer4.getAnswerBodyHash()).isEqualTo(expectedHashCode);
    }
}
