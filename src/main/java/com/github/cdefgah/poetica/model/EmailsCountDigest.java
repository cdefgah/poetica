package com.github.cdefgah.poetica.model;

/**
 * Используется для получения сводки по загруженным в систему письмам.
 */
public class EmailsCountDigest {

    private final int emailsQtyForTheFirstRound;
    private final int emailsQtyForTheSecondRound;

    public EmailsCountDigest(int emailsQtyForTheFirstRound, int emailsQtyForTheSecondRound) {
        this.emailsQtyForTheFirstRound = emailsQtyForTheFirstRound;
        this.emailsQtyForTheSecondRound = emailsQtyForTheSecondRound;
    }

    public int getEmailsQtyForTheFirstRound() {
        return emailsQtyForTheFirstRound;
    }

    public int getEmailsQtyForTheSecondRound() {
        return emailsQtyForTheSecondRound;
    }
}