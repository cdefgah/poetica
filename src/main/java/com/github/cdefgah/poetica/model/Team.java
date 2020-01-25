package com.github.cdefgah.poetica.model;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.util.Objects;

/**
 * Класс команды.
 */
@Entity
@Table(name = "Teams")
public final class Team {

    /**
     * Уникальный идентификатор для связи между таблицами.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Номер команды.
     */
    @Column(length = 3, nullable = true)
    @Size(min = 3, max = 3)
    private String number;

    /**
     * Название команды.
     */
    @Column(length = 256, nullable = false, unique=true)
    private String title;

    /**
     * Возвращает уникальный идентификатор.
     * @return уникальный идентификатор.
     */
    public Long getId() {
        return id;
    }

    /**
     * Устанавливает уникальный идентификатор.
     * @param id уникальный идентификатор.
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Возвращает номер команды.
     * @return номер команды.
     */
    public String getNumber() {
        return number;
    }

    /**
     * Устанавливает номер команды.
     * @param number номер команды.
     */
    public void setNumber(String number) {
        this.number = number;
    }

    /**
     * Возвращает название команды.
     * @return название команды.
     */
    public String getTitle() {
        return title;
    }

    /**
     * Устанавливает название команды.
     * @param title название команды.
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * Возвращает true, если текущий объект эквивалентен представленному аргументу.
     * @param o другой экземпляр этого класса для сравнения.
     * @return true, если экземпляры классов эквивалентны.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Team team = (Team) o;
        return id.equals(team.id);
    }

    /**
     * Хэш-код для экземпляра класса.
     * @return Хэш-код для экземпляра класса.
     */
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}