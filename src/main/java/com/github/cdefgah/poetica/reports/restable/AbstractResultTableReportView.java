package com.github.cdefgah.poetica.reports.restable;

import org.springframework.beans.factory.annotation.Autowired;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;

public class AbstractResultTableReportView {

    /**
     * Менеджер сущностей для взаимодействия с базой данных.
     */
    @Autowired
    EntityManager entityManager;


    protected int getMaxTeamNumberLength() {
        final TypedQuery<Integer> query =
                            entityManager.createQuery("select max(team.number) FROM Team team", Integer.class);

        

    }

}
