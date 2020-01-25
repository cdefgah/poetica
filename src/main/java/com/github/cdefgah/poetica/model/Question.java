package com.cdefgah.poetica.model;

import javax.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "Questions")
public final class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 4, nullable = false)
    private String number;

    @Column(length = 1024, nullable = false)
    private String body;

    @Column(nullable = false)
    private boolean outOfCompetition = false;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public boolean isOutOfCompetition() {
        return outOfCompetition;
    }

    public void setOutOfCompetition(boolean outOfCompetition) {
        this.outOfCompetition = outOfCompetition;
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