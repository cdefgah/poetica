package com.github.cdefgah.poetica.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class QuestionTest {

    @Test
    public void questionAnswerBodyHashEqualityTest() {

        final String AUTHORS_ANSWER1 = "Некий авторский ответ для объекта question";
        final String AUTHORS_ANSWER2 = "Некий         авторский  \t  ответ \tдля объекта \tquestion";
        final String AUTHORS_ANSWER3 = "Некий  \n\n\n\n       авторский  \n\t  ответ \tдля объекта \tquestion\n\n\t";
        final String AUTHORS_ANSWER4 = "\t\t\nНекий  \n\n    авторский  \t\t  ответ\tдля\nобъекта\tquestion\n\n\t";

        Question question1 = new Question();
        question1.setAuthorsAnswer(AUTHORS_ANSWER1);

        Question question2 = new Question();
        question2.setAuthorsAnswer(AUTHORS_ANSWER2);

        Question question3 = new Question();
        question3.setAuthorsAnswer(AUTHORS_ANSWER3);

        Question question4 = new Question();
        question4.setAuthorsAnswer(AUTHORS_ANSWER4);

        final String expectedHashCode = "6d851ff810f2d050085f7985ae328336e5e64ac36b456f8a6909e848904b6f2686845ea9f5747d21a01dcdc9524581f98d2799ae198a64254c8aa2d77d2f0b4f";

        assertThat(question1.getAuthorsAnswerHash()).isEqualTo(expectedHashCode);
        assertThat(question2.getAuthorsAnswerHash()).isEqualTo(expectedHashCode);
        assertThat(question3.getAuthorsAnswerHash()).isEqualTo(expectedHashCode);
        assertThat(question4.getAuthorsAnswerHash()).isEqualTo(expectedHashCode);
    }
}
