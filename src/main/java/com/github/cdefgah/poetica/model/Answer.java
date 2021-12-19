/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.model;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Класс ответа на задание.
 */
@Entity
@Table(name = "Answers")
public final class Answer extends QuestionAnswerPrototype {

    /**
     * Ограничения на размер полей.
     */
    private static class ModelConstraints {
        static final int MAX_BODY_LENGTH = 1024;
        static final int MAX_COMMENT_LENGTH = 256;
    }

    /**
     * Содержит ограничения на размер полей.
     */
    private static final Map<String, String> modelConstraintsMap;

    static {
        final Map<String, String> localConstraintsMap = new HashMap<>();
        localConstraintsMap.put("MAX_BODY_LENGTH", String.valueOf(ModelConstraints.MAX_BODY_LENGTH));
        localConstraintsMap.put("MAX_COMMENT_LENGTH", String.valueOf(ModelConstraints.MAX_COMMENT_LENGTH));
        modelConstraintsMap = Collections.unmodifiableMap(localConstraintsMap);
    }

    /**
     * Отдаёт информацию об ограничениях на размер полей.
     *
     * @return информация об ограничениях на размер полей.
     */
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

    /**
     * Номер вопроса.
     */
    @Column(nullable = false)
    private int questionNumber;

    /**
     * Уникальный идентификатор письма, в котором пришёл этот ответ.
     */
    @Column(nullable = false)
    private Long emailId;

    /**
     * Номер тура (раунда) на который было прислано письмо с этим ответом.
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
    @Column(length = ModelConstraints.MAX_COMMENT_LENGTH)
    @Size(max = ModelConstraints.MAX_COMMENT_LENGTH)
    private String comment;

    /**
     * Оценка ответу, выставленная дежурной командой.
     */
    @Column()
    @Enumerated(EnumType.STRING)
    private Grade grade = Grade.None;

    /**
     * SHA-512 хэш для ответа, для вычисления совпадающих ответов.
     */
    @Column()
    private String answerBodyHash;

    /**
     * Время отправки письма с этим ответом.
     */
    private long emailSentOn;

    /**
     * Отдаёт уникальный идентификатор ответа.
     *
     * @return уникальный идентификатор ответа.
     */
    public Long getId() {
        return id;
    }

    /**
     * Отдаёт уникальный идентификатор команды, приславшей ответ.
     *
     * @return уникальный идентификатор команды, приславшей ответ.
     */
    public Long getTeamId() {
        return teamId;
    }

    /**
     * Устанавливает уникальный идентификатор команды, приславшей ответ.
     *
     * @param teamId уникальный идентификатор команды, приславшей ответ.
     */
    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    /**
     * Отдаёт уникальный идентификатор вопроса (задания), на который дан ответ.
     *
     * @return уникальный идентификатор вопроса (задания), на который дан ответ.
     */
    public Long getQuestionId() {
        return questionId;
    }

    /**
     * Устанавливает уникальный идентификатор вопроса (задания), на который дан ответ.
     *
     * @param questionId уникальный идентификатор вопроса (задания), на который дан ответ.
     */
    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    /**
     * Отдаёт уникальный идентификатор письма, в котором пришёл этот ответ.
     *
     * @return уникальный идентификатор письма, в котором пришёл этот ответ.
     */
    public Long getEmailId() {
        return emailId;
    }

    /**
     * Устанавливает уникальный идентификатор письма, в котором пришёл этот ответ.
     *
     * @param emailId уникальный идентификатор письма, в котором пришёл этот ответ.
     */
    public void setEmailId(Long emailId) {
        this.emailId = emailId;
    }

    /**
     * Возвращает номер раунда (тура), на который было прислано письмо с этим ответом.
     *
     * @return номер раунда (тура), на который было прислано письмо с этим ответом.
     */
    public int getRoundNumber() {
        return roundNumber;
    }

    /**
     * Устанавливает номер раунда (тура), на который было прислано письмо с этим ответом.
     *
     * @param roundNumber номер раунда (тура), на который было прислано письмо с этим ответом.
     */
    public void setRoundNumber(int roundNumber) {
        this.roundNumber = roundNumber;
    }

    /**
     * Отдаёт содержимое тела ответа.
     *
     * @return содержимое тела ответа.
     */
    public String getBody() {
        return body;
    }

    /**
     * Устанавливает содержимое тела ответа.
     *
     * @param body содержимое тела ответа.
     */
    public void setBody(String body) {
        this.body = body;
        buildAndSetAnswerBodyHash();
    }

    /**
     * Формирует hash-код для тела ответа.
     * Публичный метод нужен для ситуаций, когда идёт работа с базой, созданной в предыдущей версии Poetica.
     */
    public void buildAndSetAnswerBodyHash() {
        this.answerBodyHash = this.getHashForRawText(this.body);
    }

    /**
     * Возвращает true, если для тела ответа рассчитан hash-код.
     * @return true, если для тела ответа рассчитан hash-код.
     */
    public boolean IsAnswerBodyHashPresent() {
        return (answerBodyHash != null && !answerBodyHash.isEmpty());
    }

    /**
     * Отдаёт комментарий к ответу.
     *
     * @return комментарий к ответу.
     */
    public String getComment() {
        return comment;
    }

    /**
     * Устанавливает комментарий к ответу.
     *
     * @param comment комментарий к ответу.
     */
    public void setComment(String comment) {
        this.comment = comment;
    }

    /**
     * Отдаёт оценку ответа.
     *
     * @return оценка ответа.
     */
    public Grade getGrade() {
        return grade;
    }

    /**
     * Устанавливает оценку для ответа.
     *
     * @param grade оценка для ответа.
     */
    public void setGrade(Grade grade) {
        this.grade = grade;
    }

    /**
     * Отдаёт номер вопроса (задания), на который дан ответ.
     *
     * @return номер вопроса (задания), на который дан ответ.
     */
    public int getQuestionNumber() {
        return questionNumber;
    }

    /**
     * Устанавливает номер вопроса (задания), на который дан ответ.
     *
     * @param questionNumber номер вопроса (задания), на который дан ответ.
     */
    public void setQuestionNumber(int questionNumber) {
        this.questionNumber = questionNumber;
    }

    /**
     * Отдаёт время отправки письма в миллисекундах.
     *
     * @return время отправки письма в миллисекундах.
     */
    public long getEmailSentOn() {
        return emailSentOn;
    }

    /**
     * Устанавливает время отправки письма в миллисекундах.
     *
     * @param emailSentOn время отправки письма в миллисекундах.
     */
    public void setEmailSentOn(long emailSentOn) {
        this.emailSentOn = emailSentOn;
    }

    /**
     * Отдаёт содержимое тела ответа вместе с комментарием.
     *
     * @return содержимое тела ответа вместе с комментарием.
     */
    public String getBodyWithComment() {
        String answerComment = this.comment != null ? this.comment : "";
        if (answerComment.isEmpty()) {
            return this.body;
        } else {
            return this.body + " % " + answerComment;
        }
    }

    /**
     * Возвращает true, если ответ зачтён.
     *
     * @return true, если ответ зачтён.
     */
    public boolean isAccepted() {
        return this.grade == Grade.Accepted;
    }

    /**
     * Отдаёт SHA-512 хэш код тела ответа.
     * @return SHA-512 хэш код тела ответа.
     */
    public String getAnswerBodyHash() {
        return answerBodyHash;
    }
}