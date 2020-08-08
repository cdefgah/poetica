package com.github.cdefgah.poetica.reports.restable;

import org.springframework.beans.factory.annotation.Autowired;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.util.Collections;

public class AbstractResultTableReportView {

    /**
     * Менеджер сущностей для взаимодействия с базой данных.
     */
    @Autowired
    EntityManager entityManager;

    protected int maxTeamNumberLength;

    public AbstractResultTableReportView() {
        maxTeamNumberLength = getMaxTeamNumberLength();
    }

    /**
     * Формирует и отдаёт выровненный по правому краю текст.
     * @param placeHolderLength длина поля в символах, в котором будет располагаться текст.
     * @param text текст, который должен быть выровнен по правому краю пробелами.
     * @return выровненный по правому краю пробелами текст.
     */
    protected String getRightAlignedText(int placeHolderLength, String text) {
        final int lengthDelta = placeHolderLength - text.length();
        if (lengthDelta > 0) {
            return String.join("", Collections.nCopies(lengthDelta, " ")) + text;
        } else {
            return text;
        }
    }

    /**
     * Возвращает максимальную длину в символах номера команды.
     * @return максимальная длина в символах номера команды.
     */
    private int getMaxTeamNumberLength() {
        TypedQuery<Integer> query = entityManager.createQuery("select max(team.number) FROM Team team",
                Integer.class);
        final Integer maxTeamNumberObject = query.getSingleResult();
        final int maxTeamNumber = maxTeamNumberObject != null ? maxTeamNumberObject : 0;
        return String.valueOf(maxTeamNumber).length();
    }
}
