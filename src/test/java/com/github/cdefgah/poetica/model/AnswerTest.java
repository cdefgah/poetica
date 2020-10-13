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
}
