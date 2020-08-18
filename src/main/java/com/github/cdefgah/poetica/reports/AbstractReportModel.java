package com.github.cdefgah.poetica.reports;

import com.github.cdefgah.poetica.model.Team;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

public abstract class AbstractReportModel {

    /**
     * Менеджер сущностей для взаимодействия с базой данных.
     */
    protected final EntityManager entityManager;

    private final String reportGeneratedOnMSKTime;

    protected final int minQuestionNumber;

    protected final int maxQuestionNumber;

    public AbstractReportModel(EntityManager entityManager) {
        this.entityManager = entityManager;

        minQuestionNumber = calculateMinQuestionNumber();
        maxQuestionNumber = calculateMaxQuestionNumber();

        reportGeneratedOnMSKTime = LocalDateTime.now(ZoneId.of("Europe/Moscow"))
                                                           .format(DateTimeFormatter.ofPattern("d.MM.yyyy HH:mm"));
    }

    public String getReportGeneratedOnMSKTime() {
        return reportGeneratedOnMSKTime;
    }

    public int getMinQuestionNumber() {
        return minQuestionNumber;
    }

    public int getMaxQuestionNumber() {
        return maxQuestionNumber;
    }

    protected List<Team> getParticipatedTeams() {
        TypedQuery<Team> query = entityManager.createQuery("select distinct team from Team team, " +
                "Email email where team.id=email.teamId", Team.class);
        return query.getResultList();
    }

    private int calculateMaxQuestionNumber() {
        TypedQuery<Integer> query = entityManager.createQuery("select max(question.lowestInternalNumber) " +
                        "FROM Question question",
                Integer.class);
        final Integer resultValue = query.getSingleResult();
        return resultValue != null ? resultValue : 0;
    }

    private int calculateMinQuestionNumber() {
        TypedQuery<Integer> query = entityManager.createQuery("select min(question.lowestInternalNumber) " +
                        "FROM Question question",
                Integer.class);
        final Integer resultValue = query.getSingleResult();
        return resultValue != null ? resultValue : 0;
    }
}
