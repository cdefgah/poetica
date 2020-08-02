package com.github.cdefgah.poetica.reports;

import com.github.cdefgah.poetica.model.Team;
import org.springframework.beans.factory.annotation.Autowired;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;

abstract class AbstractResultTableReport {

    /**
     * Менеджер сущностей для взаимодействия с базой данных.
     */
    @Autowired
    EntityManager entityManager;

    protected int maxTeamNumberLength;

    public AbstractResultTableReport() {
        this.maxTeamNumberLength = getMaxTeamNumberLength();
    }

    protected String getFormattedTeamNumber(Team team) {
        final int delta = maxTeamNumberLength - String.valueOf(team.getNumber()).length();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < delta; i++) {
            sb.append(' ');
        }
        sb.append(team.getNumber());

        return sb.toString();
    }

    private int getMaxTeamNumberLength() {
        TypedQuery<Integer> query = entityManager.createQuery("select max(team.number) FROM Team team",
                Integer.class);
        final Integer maxTeamNumberObject = query.getSingleResult();
        return maxTeamNumberObject != null ? maxTeamNumberObject : 0;
    }

    public abstract String getFileNamePart();

    public abstract String getReportText();
}
