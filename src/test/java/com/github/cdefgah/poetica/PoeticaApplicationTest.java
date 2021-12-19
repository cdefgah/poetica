/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica;

import com.github.cdefgah.poetica.controllers.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;

@SpringBootTest
class PoeticaApplicationTest {

    @Autowired
    private AnswersController answersController;

    @Autowired
    private ConfigurationController configurationController;

    @Autowired
    private EmailsController emailsController;

    @Autowired
    private QuestionsController questionsController;

    @Autowired
    private ReportsController reportsController;

    @Autowired
    private ShutdownController shutdownController;

    @Autowired
    private TeamsController teamsController;

    @Test
    @DisplayName("All controllers have been created properly")
    public void contextLoads() {
        assertThat(answersController, is(notNullValue()));
        assertThat(configurationController, is(notNullValue()));
        assertThat(emailsController, is(notNullValue()));
        assertThat(questionsController, is(notNullValue()));
        assertThat(reportsController, is(notNullValue()));
        assertThat(shutdownController, is(notNullValue()));
        assertThat(teamsController, is(notNullValue()));
    }
}