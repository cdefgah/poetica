/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.controllers;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class EmailsControllerTest extends AbstractRestControllerTest {

    @Test
    public void testModelConstraintsRequest() throws Exception {
        final String endpointAddress = "/emails/model-constraints";
        final String url = localAddressPrefix + port + endpointAddress;
        final String expectedString = "{\"MAX_BODY_LENGTH\":\"32768\",\"MAX_SUBJECT_LENGTH\":\"256\"}";

        assertThat(this.restTemplate.getForObject(url, String.class)).isEqualTo(expectedString);
    }
}
