package com.github.cdefgah.poetica.model;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.util.Objects;


/**
 * Класс вопроса (бескрылки).
 */
@Entity
@Table(name = "Questions")
public final class Question {

    /**
     * Уникальный внутренний идентификатор вопроса для связи таблиц между собой.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Если вопрос (бескрылка) зачётный, то хранит значение true. Иначе - false.
     */
    @Column(nullable = false)
    private boolean isCredited = true;

    /**
     * Уникальный номер бескрылки, видим участниками состязания.
     * Представляет собой трёхзначное целое положительное числое.
     */
    @Column(length = 3, nullable = false)
    @Size(min = 1, max = 3)
    private String number;

    /**
     * Содержание вопроса (бескрылки).
     */
    @Column(length = 1024, nullable = false)
    private String body;

    /**
     * Источник бескрылки.
     */
    @Column(length = 256, nullable = false)
    private String source;

    /**
     * Комментарий к бескрылке от автора.
     */
    @Column(length = 1024, nullable = true)
    private String comment;

    public Question() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isCredited() {
        return isCredited;
    }

    public void setCredited(boolean credited) {
        isCredited = credited;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Question question = (Question) o;
        return id.equals(question.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}