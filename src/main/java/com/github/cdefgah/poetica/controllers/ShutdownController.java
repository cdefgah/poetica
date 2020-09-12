/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.controllers;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ShutdownController implements ApplicationContextAware {

    private ApplicationContext context;

    @PostMapping("/shutdownContext")
    public void shutdownContext() {
        ((ConfigurableApplicationContext) context).close();
    }

    @Override
    public void setApplicationContext(ApplicationContext ctx) throws BeansException {
        this.context = ctx;
    }
}
