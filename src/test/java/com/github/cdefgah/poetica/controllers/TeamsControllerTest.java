/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.controllers;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class TeamsControllerTest  extends AbstractRestControllerTest {

    @Test
    public void testModelConstraintsRequest() throws Exception {
        final String endpointAddress = "/teams/model-constraints";
        final String url = localAddressPrefix + port + endpointAddress;
        final String expectedString =
               "{\"MAX_NUMBER_VALUE\":\"99999\",\"MAX_TITLE_LENGTH\":\"256\"}";

        assertThat(this.restTemplate.getForObject(url, String.class)).isEqualTo(expectedString);
    }
}
