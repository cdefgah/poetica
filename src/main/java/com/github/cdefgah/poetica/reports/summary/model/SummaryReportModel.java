/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.reports.summary.model;

import com.github.cdefgah.poetica.model.Email;
import com.github.cdefgah.poetica.model.Team;
import com.github.cdefgah.poetica.reports.AbstractReportModel;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.util.*;

public class SummaryReportModel extends AbstractReportModel {

    // TODO переделать с SQL запросами
    private final Map<Long, Team> teamMap = new HashMap<>();

    private final int roundNumber;

    private int totalTeamsCount;
    private int totalEmailsCount;

    private List<SummaryReportRow> summaryReportRows = new ArrayList<>();

    public SummaryReportModel(EntityManager entityManager, int roundNumber) {
        super(entityManager);
        this.roundNumber = roundNumber;

        initializeTeamMap();
        generateReportRows();
    }

    public int getRoundNumber() {
        return roundNumber;
    }

    private void initializeTeamMap() {
        final TypedQuery<Team> query =
                                  entityManager.createQuery("select team from Team team", Team.class);
        final List<Team> teamList = query.getResultList();
        teamList.forEach(team -> teamMap.put(team.getId(), team));
    }

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

    public List<SummaryReportRow> getSummaryReportRows() {
        return Collections.unmodifiableList(summaryReportRows);
    }

    public int getTotalTeamsCount() {
        return totalTeamsCount;
    }

    public int getTotalEmailsCount() {
        return totalEmailsCount;
    }

    // ===========================================================

    public static final class SummaryReportRow implements Comparable {
        private final String teamTitle;
        private final int emailsCount;

        public SummaryReportRow(String teamTitle, int emailsCount) {
            this.teamTitle = teamTitle;
            this.emailsCount = emailsCount;
        }

        public String getTeamTitle() {
            return teamTitle;
        }

        public int getEmailsCount() {
            return emailsCount;
        }

        @Override
        public String toString() {
            return this.teamTitle + "  [" + this.emailsCount + "]";
        }

        @Override
        public int compareTo(Object anotherSummaryReportRow) {
            return this.teamTitle.compareTo(((SummaryReportRow)anotherSummaryReportRow).teamTitle);
        }
    }
}
