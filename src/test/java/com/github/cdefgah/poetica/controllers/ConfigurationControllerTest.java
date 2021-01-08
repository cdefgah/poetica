/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.controllers;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class ConfigurationControllerTest extends AbstractRestControllerTest{

    @Test
    public void testSupportedEncodingsRequest() throws Exception {
        final String endpointAddress = "/configuration/supported-report-encodings/";
        final String url = localAddressPrefix + port + endpointAddress;
        final String expectedString =
                        "[{\"humanReadableTitle\":\"Юникод (Unicode)\",\"systemName\":\"UTF8\"}," +
                                            "{\"humanReadableTitle\":\"КОИ-8Р (KOI-8R)\",\"systemName\":\"KOI8_R\"}]";

        assertThat(this.restTemplate.getForObject(url, String.class)).isEqualTo(expectedString);
    }
}