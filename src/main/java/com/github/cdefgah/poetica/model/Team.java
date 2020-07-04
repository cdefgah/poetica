package com.github.cdefgah.poetica.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * Класс команды.
 */
@Entity
@Table(name = "Teams")
public final class Team {

    private static class ModelConstraints {
        static final int MAX_TITLE_LENGTH = 256;
    }

    private static final Map<String, String> modelConstraintsMap;

    static
    {
        final Map<String, String> localConstraintsMap = new HashMap<>();
        localConstraintsMap.put("MAX_TITLE_LENGTH", String.valueOf(Team.ModelConstraints.MAX_TITLE_LENGTH));
        modelConstraintsMap = Collections.unmodifiableMap(localConstraintsMap);
    }

    /**
     * Уникальный идентификатор для связи между таблицами.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Номер команды.
     */
    @Column(nullable = false, unique = true)
    private String number;

    /**
     * Название команды.
     */
    @Column(length = 64, nullable = false, unique=true)
    private String title;

    /**
     * Название команды в нижнем регистре, для поиска.
     * Это поле нужно, так как SQLite не поддерживает LOWER для unicode-строк, а только для латиинницы.
     */
    @JsonIgnore
    @Column(length = 64, nullable = false, unique=true)
    private String titleInLowerCase;

    public Team() {

    }

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

    public static Map<String, String> getModelConstraintsMap() {
        return modelConstraintsMap;
    }

    public String getTitleInLowerCase() {
        return titleInLowerCase;
    }

    public void setTitleInLowerCase(String titleInLowerCase) {
        this.titleInLowerCase = titleInLowerCase;
    }
}