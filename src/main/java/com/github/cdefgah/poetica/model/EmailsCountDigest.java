/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.model;

/**
 * Используется для получения сводки по загруженным в систему письмам для той или иной команды.
 */
public final class EmailsCountDigest {

    /**
     * Количество писем, присланных на предварительный тур (раунд).
     */
    private final long emailsQtyForTheFirstRound;

    /**
     * Количество писем, присланных на основной тур (раунд).
     */
    private final long emailsQtyForTheSecondRound;

    /**
     * Конструктор класса.
     * @param emailsQtyForTheFirstRound количество писем, присланных на предварительный тур (раунд).
     * @param emailsQtyForTheSecondRound количество писем, присланных на основной тур (раунд).
     */
    public EmailsCountDigest(long emailsQtyForTheFirstRound, long emailsQtyForTheSecondRound) {
        this.emailsQtyForTheFirstRound = emailsQtyForTheFirstRound;
        this.emailsQtyForTheSecondRound = emailsQtyForTheSecondRound;
    }

    /**
     * Отдаёт количество писем, присланных на предварительный тур (раунд).
     * @return количество писем, присланных на предварительный тур (раунд).
     */
    public long getEmailsQtyForTheFirstRound() {
        return emailsQtyForTheFirstRound;
    }

    /**
     * Отдаёт количество писем, присланных на основной тур (раунд).
     * @return количество писем, присланных на основной тур (раунд).
     */
    public long getEmailsQtyForTheSecondRound() {
        return emailsQtyForTheSecondRound;
    }
}