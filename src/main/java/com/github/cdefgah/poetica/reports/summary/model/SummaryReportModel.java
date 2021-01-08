/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.reports.summary.model;

import com.github.cdefgah.poetica.model.Email;
import com.github.cdefgah.poetica.model.Team;
import com.github.cdefgah.poetica.reports.AbstractReportModel;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Модель данных для отчёта "Сводка".
 */
public class SummaryReportModel extends AbstractReportModel {

    /**
     * Таблица для быстрого доступа к команде по её номеру.
     */
    private final Map<Long, Team> teamMap = new HashMap<>();

    /**
     * Номер тура (раунда).
     */
    private final int roundNumber;

    /**
     * Общее количество команд.
     */
    private int totalTeamsCount;

    /**
     * Общее количество писем.
     */
    private int totalEmailsCount;

    /**
     * Список со строками отчёта.
     */
    private final List<SummaryReportRow> summaryReportRows = new ArrayList<>();

    /**
     * Конструктор класса.
     * @param entityManager менеджер сущностей для работы с базой данных.
     * @param roundNumber номер раунда (тура).
     */
    public SummaryReportModel(EntityManager entityManager, int roundNumber) {
        super(entityManager);
        this.roundNumber = roundNumber;

        initializeTeamMap();
        generateReportRows();
    }

    /**
     * Возвращает номер раунда (тура).
     * @return номер раунда (тура).
     */
    public int getRoundNumber() {
        return roundNumber;
    }

    /**
     * Инициализирует таблицу для быстрого доступа к информации о команде по её номеру.
     */
    private void initializeTeamMap() {
        final TypedQuery<Team> query =
                                  entityManager.createQuery("select team from Team team", Team.class);
        final List<Team> teamList = query.getResultList();
        teamList.forEach(team -> teamMap.put(team.getId(), team));
    }

    /**
     * Формирует список строк отчёта.
     */
    private void generateReportRows() {
        final TypedQuery<Email> query =
                           entityManager.createQuery("select email from Email email " +
                                           "where email.roundNumber=:roundNumber order by email.teamId", Email.class);

        query.setParameter("roundNumber", this.roundNumber);

        final List<Email> emailList = query.getResultList();
        if (emailList.isEmpty()) {
            return;
        }

        long processingTeamId = emailList.get(0).getTeamId();
        this.totalTeamsCount = 1;
        int teamEmailsCount = 0;
        for (Email email: emailList) {
            if (email.getTeamId() == processingTeamId) {
                teamEmailsCount++;
            } else {
                summaryReportRows.add(new SummaryReportRow(teamMap.get(processingTeamId).getTitle(), teamEmailsCount));

                this.totalTeamsCount++;
                processingTeamId = email.getTeamId();
                teamEmailsCount = 1;
            }
        }

        // добавляем последнюю команду
        summaryReportRows.add(new SummaryReportRow(teamMap.get(processingTeamId).getTitle(), teamEmailsCount));

        this.totalEmailsCount = emailList.size();

        // сортируем по названию команды
        Collections.sort(summaryReportRows);
    }

    /**
     * Возвращает неизменяемый список со строками отчёта.
     * @return неизменяемый список со строками отчёта.
     */
    public List<SummaryReportRow> getSummaryReportRows() {
        return Collections.unmodifiableList(summaryReportRows);
    }

    /**
     * Возвращает число команд.
     * @return число команд.
     */
    public int getTotalTeamsCount() {
        return totalTeamsCount;
    }

    /**
     * Возвращает количество писем.
     * @return количество писем.
     */
    public int getTotalEmailsCount() {
        return totalEmailsCount;
    }

    // ===========================================================

    /**
     * Модель данных строки отчёта "Сводка".
     */
    public static final class SummaryReportRow implements Comparable<SummaryReportRow> {

        /**
         * Название команды.
         */
        private final String teamTitle;

        /**
         * Количество писем.
         */
        private final int emailsCount;

        /**
         * Конструктор класса.
         * @param teamTitle название команды.
         * @param emailsCount количество писем.
         */
        public SummaryReportRow(String teamTitle, int emailsCount) {
            this.teamTitle = teamTitle;
            this.emailsCount = emailsCount;
        }

        /**
         * Возвращает название команды.
         * @return название команды.
         */
        public String getTeamTitle() {
            return teamTitle;
        }

        /**
         * Возвращает количество писем.
         * @return количество писем.
         */
        public int getEmailsCount() {
            return emailsCount;
        }

        /**
         * Возвращает строковое представление экземпляра класса.
         * @return строковое представление экземпляра класса.
         */
        @Override
        public String toString() {
            return this.teamTitle + "  [" + this.emailsCount + "]";
        }

        /**
         * Выполняет сравнение текущей строки со строкой, переданной в параметрах.
         * @param anotherSummaryReportRow строка отчёта, с которой будет выполняться сравнение текущей строки отчёта.
         * @return 0 - если строки равны, -1 - если текущая строка отчёта меньше, 1 - если текущая строка отчёта больше.
         */
        @Override
        public int compareTo(SummaryReportRow anotherSummaryReportRow) {
            return this.teamTitle.compareTo((anotherSummaryReportRow).teamTitle);
        }
    }
}
