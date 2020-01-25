package com.github.cdefgah.poetica.model;

import javax.persistence.*;
import java.util.Objects;

/**
 * Класс ответа на вопрос (бескрылку).
 */
@Entity
@Table(name = "Answers")
public final class Answer {

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
     * Идентификатор сохранённого сообщения электронной почты с ответами.
     * Отсутствие значения для этого поля означает, что ответ добавлен вручную, через кнопку "Добавить ответ".
     * Иначе - ответ загружен из письма с ответами.
     */
    @Column(nullable = true)
    private Long emailId;

    /**
     * Если ответ дан в первом раунде (первый день) тура,
     * то в поле хранится true. Иначе - false.
     */
    @Column(nullable = false)
    private boolean isFirstRoundAnswer = false;

    /**
     * Содержимое ответа.
     */
    @Column(length = 1024, nullable = false)
    private String body;

    /**
     * Комментарий к ответу, данный ответившей командой.
     */
    @Column(length = 256, nullable = true)
    private String comment;

    /**
     * Оценка ответу, выставленная дежурной командой.
     */
    @Column(nullable = true)
    @Enumerated(EnumType.STRING)
    private Grade grade = Grade.None;

}