/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.controllers;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class AnswersControllerTest extends AbstractRestControllerTest {

    @Test
    public void testModelConstraintsRequest() throws Exception {
        final String endpointAddress = "/answers/model-constraints";
        final String url = localAddressPrefix + port + endpointAddress;
        final String expectedString = "{\"MAX_BODY_LENGTH\":\"1024\",\"MAX_COMMENT_LENGTH\":\"256\"}";


        assertThat(this.restTemplate.getForObject(url, String.class)).isEqualTo(expectedString);
    }
}
