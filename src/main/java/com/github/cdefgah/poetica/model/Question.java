package com.github.cdefgah.poetica.model;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.util.*;


/**
 * Класс вопроса (бескрылки).
 */
@Entity
@Table(name = "Questions")
public final class Question {

    private static class ModelConstraints {
        static final int MAX_TITLE_LENGTH = 128;
        static final int MAX_BODY_LENGTH = 1024;
        static final int MAX_AUTHORS_ANSWER_LENGTH = 1024;
        static final int MAX_COMMENT_LENGTH = 1024;
        static final int MAX_SOURCE_LENGTH = 256;
        static final int MAX_AUTHOR_INFO_LENGTH = 512;
    }

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

    @Column(nullable = false)
    private boolean graded;

    /**
     * Информация об авторе бескрылки.
     */
    @Column(length = ModelConstraints.MAX_AUTHOR_INFO_LENGTH, nullable = false)
    @Size(max = ModelConstraints.MAX_AUTHOR_INFO_LENGTH)
    private String authorInfo;

    public Question() {
    }

    public static Map<String, String> getModelConstraintsMap() {
        return modelConstraintsMap;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getExternalNumber() {
        return externalNumber;
    }

    public void setExternalNumber(String externalNumber) {
        this.externalNumber = externalNumber;
    }

    public int getLowestInternalNumber() {
        return lowestInternalNumber;
    }

    public void setLowestInternalNumber(int lowestInternalNumber) {
        this.lowestInternalNumber = lowestInternalNumber;
    }

    public int getHighestInternalNumber() {
        return highestInternalNumber;
    }

    public void setHighestInternalNumber(int highestInternalNumber) {
        this.highestInternalNumber = highestInternalNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public boolean isGraded() {
        return graded;
    }

    public void setGraded(boolean graded) {
        this.graded = graded;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Question question = (Question) o;
        return id == question.id;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }


    public String getAuthorsAnswer() {
        return authorsAnswer;
    }

    public void setAuthorsAnswer(String authorsAnswer) {
        this.authorsAnswer = authorsAnswer;
    }

    public String getAuthorInfo() {
        return authorInfo;
    }

    public void setAuthorInfo(String authorInfo) {
        this.authorInfo = authorInfo;
    }

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

    public String getQuestionBodyOnly() {
        StringBuilder sb = new StringBuilder();
        sb.append(this.externalNumber).append('.').append(title).append('\n').append(this.body).append('\n');
        return sb.toString();
    }

    public String getQuestionWithAllProperties() {
        StringBuilder sb = new StringBuilder();
        sb.append(this.externalNumber).append('.').append(title).append('\n').append(this.body).append("\n\n");
        sb.append("Ответ: ").append(this.authorsAnswer).append('\n');
        if (!this.comment.isEmpty()) {
            sb.append("Комментарий: ").append(this.comment).append('\n');
        }

        sb.append("Источник: ").append(this.source).append('\n');
        sb.append("Автор: ").append(this.authorInfo).append('\n');

        return sb.toString();
    }

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