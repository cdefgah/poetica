/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.reports.collection.model.comparators;

import com.github.cdefgah.poetica.model.Answer;

import java.util.Comparator;

/**
 * Компаратор для сортировки по номеру вопроса, и по его содержимому, без комментария.
 */
public class QuestionNumberAndAnswerBodyComparator implements Comparator<Answer> {

    /**
     * Если параметры равны, вовзаращает 0. Если первый больше второго, возвращает 1, иначе возвращает -1.
     * @param firstAnswer первый ответ.
     * @param secondAnswer второй ответ.
     * @return Если параметры равны, вовзаращает 0. Если первый больше второго, возвращает 1, иначе возвращает -1.
     */
    @Override
    public int compare(Answer firstAnswer, Answer secondAnswer) {
        if (firstAnswer.getQuestionNumber() == secondAnswer.getQuestionNumber()) {
            return firstAnswer.getBody().compareTo(secondAnswer.getBody());
        } else {
            return Integer.compare(firstAnswer.getQuestionNumber(), secondAnswer.getQuestionNumber());
        }
    }
}
