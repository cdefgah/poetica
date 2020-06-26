package com.github.cdefgah.poetica.model;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * Класс ответа на вопрос (бескрылку).
 */
@Entity
@Table(name = "Answers")
public final class Answer {

    private static class ModelConstraints {
        static final int MAX_BODY_LENGTH = 1024;
        static final int MAX_COMMENT_LENGTH = 256;
    }

    private static final Map<String, String> modelConstraintsMap;

    static
    {
        final Map<String, String> localConstraintsMap = new HashMap<>();
        localConstraintsMap.put("MAX_BODY_LENGTH", String.valueOf(ModelConstraints.MAX_BODY_LENGTH));
        localConstraintsMap.put("MAX_COMMENT_LENGTH", String.valueOf(ModelConstraints.MAX_COMMENT_LENGTH));
        modelConstraintsMap = Collections.unmodifiableMap(localConstraintsMap);
    }

    public static Map<String, String> getModelConstraintsMap() {
        return modelConstraintsMap;
    }

    /**
     * Уникальный идентификатор ответа, для связи между таблицами.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Уникальный идентификатор команды, давшей ответ.
     */
    @Column(nullable = false)
    private Long teamId;

    /**
     * Уникальный идентификатор вопроса (бескрылки), на который дан ответ.
     */
    @Column(nullable = false)
    private Long questionId;

    @Column(nullable = false)
    private int questionNumber;

    /**
     * Идентификатор сохранённого сообщения электронной почты с ответами.
     * Отсутствие значения для этого поля означает, что ответ добавлен вручную, через кнопку "Добавить ответ".
     * Иначе - ответ загружен из письма с ответами.
     */
    @Column(nullable = false)
    private Long emailId;

    /**
     * Если ответ дан в первом раунде (первый день) тура,
     * то в поле хранится true. Иначе - false.
     */
    @Column(nullable = false)
    private int roundNumber;

    /**
     * Содержимое ответа.
     */
    @Column(length = ModelConstraints.MAX_BODY_LENGTH, nullable = false)
    @Size(max = ModelConstraints.MAX_BODY_LENGTH)
    private String body;

    /**
     * Комментарий к ответу, данный ответившей командой.
     */
    @Column(length = ModelConstraints.MAX_COMMENT_LENGTH, nullable = true)
    @Size(max = ModelConstraints.MAX_COMMENT_LENGTH)
    private String comment;

    /**
     * Оценка ответу, выставленная дежурной командой.
     */
    @Column(nullable = true)
    @Enumerated(EnumType.STRING)
    private Grade grade = Grade.None;

    /**
     * Время отправки письма с этим ответом.
     */
    private long emailSentOn;

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public Long getEmailId() {
        return emailId;
    }

    public void setEmailId(Long emailId) {
        this.emailId = emailId;
    }

    public int getRoundNumber() {
        return roundNumber;
    }

    public void setRoundNumber(int roundNumber) {
        this.roundNumber = roundNumber;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Grade getGrade() {
        return grade;
    }

    public void setGrade(Grade grade) {
        this.grade = grade;
    }

    public int getQuestionNumber() {
        return questionNumber;
    }

    public void setQuestionNumber(int questionNumber) {
        this.questionNumber = questionNumber;
    }

    public long getEmailSentOn() {
        return emailSentOn;
    }

    public void setEmailSentOn(long emailSentOn) {
        this.emailSentOn = emailSentOn;
    }
}