/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
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
import java.util.Objects;


/**
 * Класс вопроса (бескрылки).
 */
@Entity
@Table(name = "Questions")
public final class Question {

    /**
     * Информация об ограничениях на длину полей.
     */
    private static class ModelConstraints {
        static final int MAX_TITLE_LENGTH = 128;
        static final int MAX_BODY_LENGTH = 1024;
        static final int MAX_AUTHORS_ANSWER_LENGTH = 1024;
        static final int MAX_COMMENT_LENGTH = 1024;
        static final int MAX_SOURCE_LENGTH = 256;
        static final int MAX_AUTHOR_INFO_LENGTH = 512;
    }

    /**
     * Для формирования ответа на запрос об ограничениях на длину полей.
     */
    private static final Map<String, String> modelConstraintsMap;

    static
    {
        final Map<String, String> localConstraintsMap = new HashMap<>();
        localConstraintsMap.put("MAX_TITLE_LENGTH", String.valueOf(ModelConstraints.MAX_TITLE_LENGTH));
        localConstraintsMap.put("MAX_BODY_LENGTH", String.valueOf(ModelConstraints.MAX_BODY_LENGTH));
        localConstraintsMap.put("MAX_AUTHORS_ANSWER_LENGTH", String.valueOf(ModelConstraints.MAX_AUTHORS_ANSWER_LENGTH));
        localConstraintsMap.put("MAX_COMMENT_LENGTH", String.valueOf(ModelConstraints.MAX_COMMENT_LENGTH));
        localConstraintsMap.put("MAX_SOURCE_LENGTH", String.valueOf(ModelConstraints.MAX_SOURCE_LENGTH));
        localConstraintsMap.put("MAX_AUTHOR_INFO_LENGTH", String.valueOf(ModelConstraints.MAX_AUTHOR_INFO_LENGTH));

        modelConstraintsMap = Collections.unmodifiableMap(localConstraintsMap);
    }

    /**
     * Уникальный внутренний идентификатор вопроса для связи таблиц между собой.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    /**
     * Отображаемый номер бескрылки.
     * Для однокрылок - одно число, 0 или любое положительное целое.
     * Для многокрылок, все номера перечислены через -.
     * Например для двукрылок, оцениваемых по одному очку за крыло: 8-9
     */
    @Column(nullable = false)
    private String externalNumber;

    /**
     * Если задание содержит несколько номеров, то наименьший.
     */
    private int lowestInternalNumber;

    /**
     * Если задание содержит несколько номеров, то наибольший.
     */
    private int highestInternalNumber;

    /**
     * Содержание вопроса (бескрылки).
     */
    @Column(length = ModelConstraints.MAX_TITLE_LENGTH, nullable = false)
    @Size(max = ModelConstraints.MAX_TITLE_LENGTH)
    private String title;

    /**
     * Содержание вопроса (бескрылки).
     */
    @Column(length = ModelConstraints.MAX_BODY_LENGTH, nullable = false)
    @Size(max = ModelConstraints.MAX_BODY_LENGTH)
    private String body;

    /**
     * Ответ автора на бескрылку.
     */
    @Column(length = ModelConstraints.MAX_AUTHORS_ANSWER_LENGTH, nullable = false)
    @Size(max = ModelConstraints.MAX_AUTHORS_ANSWER_LENGTH)
    private String authorsAnswer;

    /**
     * Источник бескрылки.
     */
    @Column(length = ModelConstraints.MAX_SOURCE_LENGTH, nullable = false)
    @Size(max = ModelConstraints.MAX_SOURCE_LENGTH)
    private String source;

    /**
     * Комментарий к бескрылке от автора.
     */
    @Column(length = ModelConstraints.MAX_COMMENT_LENGTH)
    private String comment;

    /**
     * true, если задание зачётное.
     */
    @Column(nullable = false)
    private boolean graded;

    /**
     * Информация об авторе бескрылки.
     */
    @Column(length = ModelConstraints.MAX_AUTHOR_INFO_LENGTH, nullable = false)
    @Size(max = ModelConstraints.MAX_AUTHOR_INFO_LENGTH)
    private String authorInfo;

    /**
     * Конструктор класса.
     */
    public Question() {
    }

    /**
     * Возвращает true, если у задания только один номер, оно не состоит из нескольких крыльев.
     * @return true, если у задания только один номер, оно не состоит из нескольких крыльев.
     */
    public boolean isSingleNumberQuestion() {
        return this.lowestInternalNumber == this.highestInternalNumber;
    }

    /**
     * Отдаёт информацию об ограничениях на длину полей.
     * @return информация об ограничениях на длину полей.
     */
    public static Map<String, String> getModelConstraintsMap() {
        return modelConstraintsMap;
    }

    /**
     * Отдаёт уникальный идентификатор задания (вопроса).
     * @return уникальный идентификатор задания (вопроса).
     */
    public long getId() {
        return id;
    }

    /**
     * Отдаёт внешний номер задания (вопроса).
     * @return внешний номер задания (вопроса).
     */
    public String getExternalNumber() {
        return externalNumber;
    }

    /**
     * Устанавливает внешний номер задания (вопроса).
     * @param externalNumber внешний номер задания (вопроса).
     */
    public void setExternalNumber(String externalNumber) {
        this.externalNumber = externalNumber;
    }

    /**
     * Отдаёт минимальный внутренний номер задания.
     * @return минимальный внутренний номер задания.
     */
    public int getLowestInternalNumber() {
        return lowestInternalNumber;
    }

    /**
     * Устанавливает минимальный внутренний номер задания.
     * @param lowestInternalNumber минимальный внутренний номер задания.
     */
    public void setLowestInternalNumber(int lowestInternalNumber) {
        this.lowestInternalNumber = lowestInternalNumber;
    }

    /**
     * Отдаёт максимальный внутренний номер задания.
     * @return максимальный внутренний номер задания.
     */
    public int getHighestInternalNumber() {
        return highestInternalNumber;
    }

    /**
     * Устанавливает максимальный внутренний номер задания.
     * @param highestInternalNumber максимальный внутренний номер задания.
     */
    public void setHighestInternalNumber(int highestInternalNumber) {
        this.highestInternalNumber = highestInternalNumber;
    }

    /**
     * Отдаёт заголовок задания.
     * @return заголовок задания.
     */
    public String getTitle() {
        return title;
    }

    /**
     * Устанавливает заголовок задания.
     * @param title заголовок задания.
     */
    public void setTitle(String title) {
        this.title = title;
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
     * Отдаёт информацию об источнике для задания.
     * @return информация об источнике для задания.
     */
    public String getSource() {
        return source;
    }

    /**
     * Устанавливает информацию об источнике для задания.
     * @param source информация об источнике для задания.
     */
    public void setSource(String source) {
        this.source = source;
    }

    /**
     * Отдаёт комментарий к заданию.
     * @return комментарий к заданию.
     */
    public String getComment() {
        return comment;
    }

    /**
     * Устанавливает комментарий к заданию.
     * @param comment комментарий к заданию.
     */
    public void setComment(String comment) {
        this.comment = comment;
    }

    /**
     * Отдаёт true, если задание зачётное.
     * @return true, если задание зачётное.
     */
    public boolean isGraded() {
        return graded;
    }

    /**
     * Устанавливает признак для задания, зачётное оно или нет.
     * @param graded true, если задание зачётное.
     */
    public void setGraded(boolean graded) {
        this.graded = graded;
    }

    /**
     * Отдаёт авторский ответ на задание.
     * @return авторский ответ на задание.
     */
    public String getAuthorsAnswer() {
        return authorsAnswer;
    }

    /**
     * Устанавливает авторский ответ на задание.
     * @param authorsAnswer авторский ответ на задание.
     */
    public void setAuthorsAnswer(String authorsAnswer) {
        this.authorsAnswer = authorsAnswer;
    }

    /**
     * Отдаёт информацию об авторе задания.
     * @return информация об авторе задания.
     */
    public String getAuthorInfo() {
        return authorInfo;
    }

    /**
     * Устанавливает информацию об авторе задания.
     * @param authorInfo информация об авторе задания.
     */
    public void setAuthorInfo(String authorInfo) {
        this.authorInfo = authorInfo;
    }

    /**
     * Формирует текстовое представление экземпляра класса согласно требованиям импортёра заданий.
     * @return текстовое представление экземпляра класса согласно требованиям импортёра заданий.
     */
    public String getTextRepresentationForImporter() {
        StringBuilder sb = new StringBuilder();
        sb.append('#');

        if (this.graded) {
            sb.append(this.externalNumber);
        } else {
            sb.append('(').append(this.externalNumber).append(')');
        }

        sb.append(':').append(this.title).append('\n').append(this.body).append('\n');
        sb.append("#R: ").append(this.authorsAnswer).append('\n');
        if (!this.comment.isEmpty()) {
            sb.append("#N: ").append(this.comment).append('\n');
        }

        sb.append("#S: ").append(this.source).append('\n');
        sb.append("#A: ").append(this.authorInfo).append('\n');

        return sb.toString();
    }

    /**
     * Отдаёт заголовок задания для использования в отчёте.
     * @return заголовок задания для использования в отчёте.
     */
    private String getQuestionTitleForReport() {
        return this.isGraded() ? this.title : (this.title + " [ВНЕ ЗАЧЕТА]").trim();
    }

    /**
     * Отдаёт информацию о задании без авторского ответа.
     * @return информация о задании без авторского ответа.
     */
    public String getQuestionBodyOnly() {
        return this.externalNumber + '.' +
                getQuestionTitleForReport() + '\n' + this.body + '\n';
    }

    /**
     * Отдаёт всю информацию о задании.
     * @return вся информацию о задании.
     */
    public String getQuestionWithAllProperties() {
        StringBuilder sb = new StringBuilder();

        sb.append(this.externalNumber).append('.').append(getQuestionTitleForReport()).
                                                                    append('\n').append(this.body).append("\n\n");
        sb.append("Ответ: ").append(this.authorsAnswer).append('\n');
        if (!this.comment.isEmpty()) {
            sb.append("Комментарий: ").append(this.comment).append('\n');
        }

        sb.append("Источник: ").append(this.source).append('\n');
        sb.append("Автор: ").append(this.authorInfo).append('\n');

        return sb.toString();
    }

    /**
     * Сравнивает два экземпляра класса.
     * @param o другой экземпляр класса.
     * @return true, если содержимое двух экземпляров класса идентично.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Question question = (Question) o;
        return id == question.id;
    }

    /**
     * Отдаёт хэш-код экземпляра класса.
     * @return хэш-код экземпляра класса.
     */
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    /**
     * Отдаёт текстовое представление экземпляра класса.
     * @return текстовое представление экземпляра класса.
     */
    @Override
    public String toString() {
        return "Question{" +
                "id=" + id +
                ", externalNumber='" + externalNumber + '\'' +
                ", lowestInternalNumber=" + lowestInternalNumber +
                ", highestInternalNumber=" + highestInternalNumber +
                ", title='" + title + '\'' +
                ", body='" + body + '\'' +
                ", authorsAnswer='" + authorsAnswer + '\'' +
                ", source='" + source + '\'' +
                ", comment='" + comment + '\'' +
                ", graded=" + graded +
                ", authorInfo='" + authorInfo + '\'' +
                '}';
    }
}
