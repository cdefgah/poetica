/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.model;

import javax.persistence.*;
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


    private static class ModelConstraints {
        static final int MAX_SUBJECT_LENGTH = 256;
        static final int MAX_BODY_LENGTH = 32768;
    }

    private static final Map<String, String> modelConstraintsMap;

    static
    {
        final Map<String, String> localConstraintsMap = new HashMap<>();
        localConstraintsMap.put("MAX_SUBJECT_LENGTH", String.valueOf(ModelConstraints.MAX_SUBJECT_LENGTH));
        localConstraintsMap.put("MAX_BODY_LENGTH", String.valueOf(ModelConstraints.MAX_BODY_LENGTH));
        modelConstraintsMap = Collections.unmodifiableMap(localConstraintsMap);
    }

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

    @Column(nullable = false)
    private int roundNumber;

    @Column(length = ModelConstraints.MAX_SUBJECT_LENGTH)
    @Size(max = ModelConstraints.MAX_SUBJECT_LENGTH)
    private String subject;

    /**
     * Содержимое письма.
     */
    @Column(length = ModelConstraints.MAX_BODY_LENGTH, nullable = false)
    @Size(max = ModelConstraints.MAX_BODY_LENGTH)
    private String body;

    @Column(nullable = false)
    private String questionNumbersSequence;

    /**
     * Время отправки письма.
     */
    @Column(nullable = false)
    private long sentOn;

    @Column(nullable = false)
    private long importedOn;

    public long getSentOn() {
        return sentOn;
    }

    public void setSentOn(long sentOn) {
        this.sentOn = sentOn;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public int getRoundNumber() {
        return roundNumber;
    }

    public void setRoundNumber(int roundNumber) {
        this.roundNumber = roundNumber;
    }

    public long getImportedOn() {
        return importedOn;
    }

    public void setImportedOn(long importedOn) {
        this.importedOn = importedOn;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getQuestionNumbersSequence() {
        return questionNumbersSequence;
    }

    public void setQuestionNumbersSequence(String questionNumbersSequence) {
        this.questionNumbersSequence = questionNumbersSequence;
    }

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
