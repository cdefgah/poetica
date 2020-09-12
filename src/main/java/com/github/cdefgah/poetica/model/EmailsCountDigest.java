/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.model;

/**
 * Используется для получения сводки по загруженным в систему письмам.
 */
public final class EmailsCountDigest {

    private final long emailsQtyForTheFirstRound;
    private final long emailsQtyForTheSecondRound;

    public EmailsCountDigest(long emailsQtyForTheFirstRound, long emailsQtyForTheSecondRound) {
        this.emailsQtyForTheFirstRound = emailsQtyForTheFirstRound;
        this.emailsQtyForTheSecondRound = emailsQtyForTheSecondRound;
    }

    public long getEmailsQtyForTheFirstRound() {
        return emailsQtyForTheFirstRound;
    }

    public long getEmailsQtyForTheSecondRound() {
        return emailsQtyForTheSecondRound;
    }
}