/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.Size;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Представляет письмо с ответами.
 */
@Entity
@Table(name = "Emails")
public final class Email {

    /**
     * Информация об ограничениях на длину полей.
     */
    private static class ModelConstraints {
        static final int MAX_SUBJECT_LENGTH = 256;
        static final int MAX_BODY_LENGTH = 32768;
    }

    /**
     * Используется для формирования ответа на запрос об ограничениях на длину полей.
     */
    private static final Map<String, String> modelConstraintsMap;

    static
    {
        final Map<String, String> localConstraintsMap = new HashMap<>();
        localConstraintsMap.put("MAX_SUBJECT_LENGTH", String.valueOf(ModelConstraints.MAX_SUBJECT_LENGTH));
        localConstraintsMap.put("MAX_BODY_LENGTH", String.valueOf(ModelConstraints.MAX_BODY_LENGTH));
        modelConstraintsMap = Collections.unmodifiableMap(localConstraintsMap);
    }

    /**
     * Отдаёт информацию об ограничениях на длину полей.
     * @return информация об ограничениях на длину полей.
     */
    public static Map<String, String> getModelConstraintsMap() {
        return modelConstraintsMap;
    }

    /**
     * Уникальный идентификатор письма, для связи между таблицами.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    /**
     * Уникальный идентификатор команды, приславшей письмо.
     */
    @Column(nullable = false)
    private long teamId;

    /**
     * Номер раунда (тура), на который прислано письмо.
     */
    @Column(nullable = false)
    private int roundNumber;

    /**
     * Тема письма.
     */
    @Column(length = ModelConstraints.MAX_SUBJECT_LENGTH)
    @Size(max = ModelConstraints.MAX_SUBJECT_LENGTH)
    private String subject;

    /**
     * Содержимое письма.
     */
    @Column(length = ModelConstraints.MAX_BODY_LENGTH, nullable = false)
    @Size(max = ModelConstraints.MAX_BODY_LENGTH)
    private String body;

    /**
     * Перечень номеров вопросов (заданий), ответы на которые были даны в письме.
     */
    @Column(nullable = false)
    private String questionNumbersSequence;

    /**
     * Время отправки письма.
     */
    @Column(nullable = false)
    private long sentOn;

    /**
     * Время импортирования письма в миллисекундах.
     */
    @Column(nullable = false)
    private long importedOn;

    /**
     * Отдаёт время отправки письма в миллисекундах.
     * @return время отправки письма в миллисекундах.
     */
    public long getSentOn() {
        return sentOn;
    }

    /**
     * Устанавливает время отправки письма в миллисекундах.
     * @param sentOn время отправки письма в миллисекундах.
     */
    public void setSentOn(long sentOn) {
        this.sentOn = sentOn;
    }

    /**
     * Отдаёт тему письма.
     * @return тема письма.
     */
    public String getSubject() {
        return subject;
    }

    /**
     * Устанавливает тему письма.
     * @param subject тема письма.
     */
    public void setSubject(String subject) {
        this.subject = subject;
    }

    /**
     * Отдаёт содержимое письма.
     * @return содержимое письма.
     */
    public String getBody() {
        return body;
    }

    /**
     * Устанавливает содержимое письма.
     * @param body содержимое письма.
     */
    public void setBody(String body) {
        this.body = body;
    }

    /**
     * Отдаёт номер раунда (тура), на который прислано письмо.
     * @return номер раунда (тура), на который прислано письмо.
     */
    public int getRoundNumber() {
        return roundNumber;
    }

    /**
     * Устанавливает номер раунда (тура), на который прислано письмо.
     * @param roundNumber номер раунда (тура), на который прислано письмо.
     */
    public void setRoundNumber(int roundNumber) {
        this.roundNumber = roundNumber;
    }

    /**
     * Отдаёт время импортирования письма в миллисекундах.
     * @return время импортирования письма в миллисекундах.
     */
    public long getImportedOn() {
        return importedOn;
    }

    /**
     * Устанавливает время импортирования письма в миллисекундах.
     * @param importedOn время импортирования письма в миллисекундах.
     */
    public void setImportedOn(long importedOn) {
        this.importedOn = importedOn;
    }

    /**
     * Отдаёт уникальный идентификатор команды.
     * @return уникальный идентификатор команды.
     */
    public Long getTeamId() {
        return teamId;
    }

    /**
     * Устанавливает уникальный идентификатор команды.
     * @param teamId уникальный идентификатор команды.
     */
    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    /**
     * Отдаёт уникальный идентификатор этого письма.
     * @return уникальный идентификатор этого письма.
     */
    public long getId() {
        return id;
    }

    /**
     * Отдаёт строку с номерами заданий, на которые даны ответы в этом письме.
     * @return строка с номерами заданий, на которые даны ответы в этом письме.
     */
    public String getQuestionNumbersSequence() {
        return questionNumbersSequence;
    }

    /**
     * Устанавливает строку с номерами заданий, на которые даны ответы в этом письме.
     * @param questionNumbersSequence строка с номерами заданий, на которые даны ответы в этом письме.
     */
    public void setQuestionNumbersSequence(String questionNumbersSequence) {
        this.questionNumbersSequence = questionNumbersSequence;
    }

    /**
     * Отдаёт строковое представление экземпляра класса.
     * @return строковое представление экземпляра класса.
     */
    @Override
    public String toString() {
        return "Email{" +
                "id=" + id +
                ", teamId=" + teamId +
                ", roundNumber=" + roundNumber +
                ", subject='" + subject + '\'' +
                ", body='" + body + '\'' +
                ", questionNumbersSequence='" + questionNumbersSequence + '\'' +
                ", sentOn=" + sentOn +
                ", importedOn=" + importedOn +
                '}';
    }
}
