package com.github.cdefgah.poetica.model;

import javax.persistence.*;
import javax.validation.constraints.Size;

/**
 * Представляет письмо с ответами.
 */
@Entity
@Table(name = "Emails")
public class Email {

    /**
     * Уникальный идентификатор ответа, для связи между таблицами.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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

    /**
     * Тема письма.
     */
    @Column(length = 256, nullable = false)
    @Size(max = 256)
    private String subject;

    /**
     * Содержимое письма.
     */
    @Column(length = 16384, nullable = false)
    @Size(max = 16384)
    private String body;

}
