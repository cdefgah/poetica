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
public class Email {

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
     * Если письмо отправлено в первом раунде (первый день) тура,
     * то в поле хранится true. Иначе - false.
     */
    @Column(nullable = false)
    private boolean isFirstRoundEmail = false;

    /**
     * Время отправки письма.
     */
    @Column(nullable = false)
    private long sentOn;

    @Column(length = ModelConstraints.MAX_SUBJECT_LENGTH, nullable = false)
    @Size(max = ModelConstraints.MAX_SUBJECT_LENGTH)
    private String subject;

    /**
     * Содержимое письма.
     */
    @Column(length = ModelConstraints.MAX_BODY_LENGTH, nullable = false)
    @Size(max = ModelConstraints.MAX_BODY_LENGTH)
    private String body;


    public boolean isFirstRoundEmail() {
        return isFirstRoundEmail;
    }

    public void setFirstRoundEmail(boolean firstRoundEmail) {
        isFirstRoundEmail = firstRoundEmail;
    }

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
}
