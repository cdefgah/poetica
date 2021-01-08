/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.reports;

import com.github.cdefgah.poetica.model.Question;
import com.github.cdefgah.poetica.model.Team;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;


/**
 * Прототип для всех классов моделей отчётов.
 */
public abstract class AbstractReportModel {

    /**
     * Менеджер сущностей для взаимодействия с базой данных.
     */
    protected final EntityManager entityManager;

    /**
     * Строка с временем генерации отчёта (Московское время).
     */
    private final String reportGeneratedOnMSKTime;

    /**
     * Минимальной номер вопроса (задания).
     */
    protected final int minQuestionNumber;

    /**
     * Максимальный номер вопроса (задания).
     */
    protected final int maxQuestionNumber;

    /**
     * Конструктор класса.
     * @param entityManager менеджер сущностей для работы с базой данных.
     */
    public AbstractReportModel(EntityManager entityManager) {
        this.entityManager = entityManager;

        minQuestionNumber = calculateMinQuestionNumber();
        maxQuestionNumber = calculateMaxQuestionNumber();

        reportGeneratedOnMSKTime = getReportTimeString();
    }

    /**
     * Формирует и возвращает строку с временем генерации отчёта.
     * @return строка с временем генерации отчёта.
     */
    private String getReportTimeString() {
        final LocalDateTime today = LocalDateTime.now(ZoneId.of("Europe/Moscow"));
        final DayOfWeek dayOfWeek = today.getDayOfWeek();
        final Locale russian = new Locale("ru", "RU");
        final String dayOfWeekDisplayName = dayOfWeek.getDisplayName(TextStyle.FULL, russian);

        return dayOfWeekDisplayName + ", " + today.format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm"));
    }

    /**
     * Возвращает ссылку на менеджер сущностей.
     * @return ссылка на менеджер сущностей.
     */
    public EntityManager getEntityManager() {
        return this.entityManager;
    }

    /**
     * Возвращает строку с временем генерации отчёта.
     * @return строка с временем генерации отчёта.
     */
    public String getReportGeneratedOnMSKTime() {
        return reportGeneratedOnMSKTime;
    }

    /**
     * Возвращает минимальный номер задания.
     * @return минимальный номер задания.
     */
    public int getMinQuestionNumber() {
        return minQuestionNumber;
    }

    /**
     * Возвращаем максимальный номер задания.
     * @return максимальный номер задания.
     */
    public int getMaxQuestionNumber() {
        return maxQuestionNumber;
    }

    /**
     * Возвращает список команд, которые принимали участие в игре (присылали письма с ответами).
     * @return список команд, которые принимали участие в игре (присылали письма с ответами).
     */
    protected List<Team> getParticipatedTeams() {
        TypedQuery<Team> query = entityManager.createQuery("select distinct team from Team team, " +
                "Email email where team.id=email.teamId", Team.class);
        return query.getResultList();
    }

    /**
     * Отдаёт список номеров внезачётных заданий.
     * @return список номеров внезачётных заданий.
     */
    protected List<Integer> getNotGradedQuestionsList() {
        final TypedQuery<Question> query =
                entityManager.createQuery("select question from Question " +
                        "question where question.graded=:graded order by question.lowestInternalNumber",
                                                                                                       Question.class);
        query.setParameter("graded", false);
        final List<Question> notGradedQuestionsList = query.getResultList();
        final List<Integer> questionNumbersList = new ArrayList<>();

        for (Question question: notGradedQuestionsList) {
            if (question.isSingleNumberQuestion()) {
                // если у задания один номер, просто фиксируем его
                questionNumbersList.add(question.getLowestInternalNumber());

            } else {
                // если нет - то заполняем список номерами
                // строго говоря можно было бы оставить только этот цикл, без проверки на isSingleNumberQuestion
                // но код бы стал менее читабельным.
                for (int i = question.getLowestInternalNumber(); i <= question.getHighestInternalNumber(); i++) {
                    questionNumbersList.add(i);
                }
            }
        }

        return questionNumbersList;
    }

    /**
     * Рассчитывает и возвращает максимальный номер задания.
     * @return максимальный номер задания.
     */
    private int calculateMaxQuestionNumber() {
        TypedQuery<Integer> query = entityManager.createQuery("select max(question.lowestInternalNumber) " +
                        "FROM Question question",
                Integer.class);
        final Integer resultValue = query.getSingleResult();
        return resultValue != null ? resultValue : 0;
    }

    /**
     * Рассчитывает и возвращает минимальный номер задания.
     * @return минимальный номер задания.
     */
    private int calculateMinQuestionNumber() {
        TypedQuery<Integer> query = entityManager.createQuery("select min(question.lowestInternalNumber) " +
                        "FROM Question question",
                Integer.class);
        final Integer resultValue = query.getSingleResult();
        return resultValue != null ? resultValue : 0;
    }
}
