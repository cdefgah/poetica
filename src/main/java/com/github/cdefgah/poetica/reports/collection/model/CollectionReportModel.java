package com.github.cdefgah.poetica.reports.collection.model;

import com.github.cdefgah.poetica.model.Team;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.util.List;

public class CollectionReportModel {

    private final EntityManager entityManager;

    public CollectionReportModel(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    // TODO потом объединить отчёты в иерархию и вынести общие методы в их предка
    private List<Team> getParticipatedTeams() {
        TypedQuery<Team> query = entityManager.createQuery("select distinct team from Team team, " +
                "Email email where team.id=email.teamId", Team.class);
        return query.getResultList();
    }

}
