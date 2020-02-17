package com.github.cdefgah.poetica.model;

import javax.persistence.*;
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

    private static class ModelConstraints {
        static final int MAX_BODY_LENGTH = 1024;
        static final int MAX_SOURCE_LENGTH = 256;
        static final int MAX_COMMENT_LENGTH = 1024;
    }

    private static final Map<String, Integer> modelConstraintsMap;

    static
    {
        final Map<String, Integer> localConstraintsMap = new HashMap<>();
        localConstraintsMap.put("MAX_BODY_LENGTH", ModelConstraints.MAX_BODY_LENGTH);
        localConstraintsMap.put("MAX_SOURCE_LENGTH", ModelConstraints.MAX_SOURCE_LENGTH);
        localConstraintsMap.put("MAX_COMMENT_LENGTH", ModelConstraints.MAX_COMMENT_LENGTH);
        modelConstraintsMap = Collections.unmodifiableMap(localConstraintsMap);
    }

    /**
     * Уникальный внутренний идентификатор вопроса для связи таблиц между собой.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    /**
     * Уникальный номер бескрылки, видим участниками состязания.
     * Представляет собой трёхзначное целое положительное числое.
     */
    @Column(nullable = false)
    private int number;

    /**
     * Содержание вопроса (бескрылки).
     */
    @Column(length = ModelConstraints.MAX_BODY_LENGTH, nullable = false)
    @Size(max = ModelConstraints.MAX_BODY_LENGTH)
    private String body;

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
    private boolean isCredited;

    public Question() {
    }

    public static Map<String, Integer> getModelConstraintsMap() {
        return modelConstraintsMap;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    
    public int getNumber() {
        return number;
    }

    public void setNumber(int number) {
        this.number = number;
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

    public void setId(long id) {
        this.id = id;
    }

    public boolean isCredited() {
        return isCredited;
    }

    public void setCredited(boolean credited) {
        isCredited = credited;
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
}