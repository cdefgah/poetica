/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.reports;

import javax.persistence.EntityManager;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Прототип для всех классов-представлений отчётов.
 */
public class AbstractReportView {

    /**
     * Менеджер сущностей для взаимодействия с базой данных.
     */
    protected final EntityManager entityManager;

    /**
     * Модель данных отчёта.
     */
    protected final AbstractReportModel reportModel;

    /**
     * Конструктор класса.
     * @param reportModel модель данных отчёта.
     */
    public AbstractReportView(AbstractReportModel reportModel) {
        this.reportModel = reportModel;
        this.entityManager = reportModel.getEntityManager();
    }

    /**
     * Выдаёт строку с номерами внезачётных вопросов для отображения в отчёте.
     * @return строка с номерами внезачётных вопросов для отображения в отчёте.
     */
    protected String getNotGradedQuestionsMessage() {
        // вопросы номер {номера вопросов через запятую} игрались вне зачёта
        final StringBuilder sb = new StringBuilder();
        final List<Integer> notGradedQuestionNumbersList = reportModel.getNotGradedQuestionsList();

        if (!notGradedQuestionNumbersList.isEmpty()) {
            // получаем отсортированные номера внезачётных заданий в виде строки, через запятую
            final String stringWithNumbersOfNotGradedQuestions =
                    notGradedQuestionNumbersList.stream().map(String::valueOf)
                                                                            .collect(Collectors.joining(","));

            final boolean isPlural = notGradedQuestionNumbersList.size() > 1;
            final String prefixString = isPlural ? "Задания с номерами: " : "Задание с номером ";
            final String suffixString = isPlural ? " игрались вне зачёта." : " игралось вне зачёта.";

            sb.append(prefixString).append(stringWithNumbersOfNotGradedQuestions).append(suffixString);
        }

        return sb.toString();
    }
}
