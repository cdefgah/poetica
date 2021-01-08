/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
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

    /**
     * Информация об ограничениях на длину полей.
     */
    private static class ModelConstraints {
        static final int MAX_TITLE_LENGTH = 256;
        static final int MAX_NUMBER_VALUE = 99999;
    }

    /**
     * Используется для выполнения запроса информации об ограничениях на длину полей.
     */
    private static final Map<String, String> modelConstraintsMap;

    static
    {
        final Map<String, String> localConstraintsMap = new HashMap<>();
        localConstraintsMap.put("MAX_TITLE_LENGTH", String.valueOf(Team.ModelConstraints.MAX_TITLE_LENGTH));
        localConstraintsMap.put("MAX_NUMBER_VALUE", String.valueOf(Team.ModelConstraints.MAX_NUMBER_VALUE));
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
    private int number;

    /**
     * Название команды.
     */
    @Column(length = 64, nullable = false, unique=true)
    private String title;

    /**
     * Название команды в нижнем регистре, для поиска.
     * Это поле нужно, так как SQLite не поддерживает LOWER для unicode-строк, а только для латинницы.
     */
    @JsonIgnore
    @Column(length = 64, nullable = false, unique=true)
    private String titleInLowerCase;

    /**
     * Конструктор класса.
     */
    public Team() {

    }

    /**
     * Отдаёт максимальную длину в символах для номера команды.
     * @return максимальная длина в символах для номера команды.
     */
    public static int getMaxTeamNumberValueLength() {
        return String.valueOf(ModelConstraints.MAX_NUMBER_VALUE).length();
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
    public int getNumber() {
        return number;
    }

    /**
     * Устанавливает номер команды.
     * @param number номер команды.
     */
    public void setNumber(int number) {
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

    /**
     * Отдаёт информацию об ограничениях на размер полей.
     * @return информация об ограничениях на размер полей.
     */
    public static Map<String, String> getModelConstraintsMap() {
        return modelConstraintsMap;
    }

    /**
     * Отдаёт название команды в нижнем регистре.
     * @return название команды в нижнем регистре.
     */
    public String getTitleInLowerCase() {
        return titleInLowerCase;
    }

    /**
     * Устанавливает название команды в нижнем регистре.
     * @param titleInLowerCase название команды в нижнем регистре.
     */
    public void setTitleInLowerCase(String titleInLowerCase) {
        this.titleInLowerCase = titleInLowerCase;
    }

    /**
     * Отдаёт текстовое представление экземпляра класса согласно требованиям импортёра команд.
     * @return текстовое представление экземпляра класса согласно требованиям импортёра команд.
     */
    @JsonIgnore
    public String getTextRepresentationForImporter() {
        StringBuilder sb = new StringBuilder();
        sb.append(this.number).append(',').append(this.title).append('\n');
        return sb.toString();
    }

    @Override
    public String toString() {
        return "Team{" +
                "id=" + id +
                ", number=" + number +
                ", title='" + title + '\'' +
                ", titleInLowerCase='" + titleInLowerCase + '\'' +
                '}';
    }
}