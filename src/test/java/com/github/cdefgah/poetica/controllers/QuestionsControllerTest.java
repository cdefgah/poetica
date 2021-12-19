/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.controllers;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class QuestionsControllerTest extends AbstractRestControllerTest {

    @Test
    public void testModelConstraintsRequest() throws Exception {
        final String endpointAddress = "/questions/model-constraints";
        final String url = localAddressPrefix + port + endpointAddress;
        final String expectedString =
                "{\"MAX_AUTHORS_ANSWER_LENGTH\":\"1024\",\"MAX_BODY_LENGTH\":\"1024\"," +
                        "\"MAX_SOURCE_LENGTH\":\"256\",\"MAX_TITLE_LENGTH\":\"128\"," +
                        "\"MAX_COMMENT_LENGTH\":\"1024\",\"MAX_AUTHOR_INFO_LENGTH\":\"512\"}";

        assertThat(this.restTemplate.getForObject(url, String.class)).isEqualTo(expectedString);
    }
}
