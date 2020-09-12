/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica;

import com.github.cdefgah.poetica.model.config.Configuration;
import com.github.cdefgah.poetica.utils.AppVersion;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class PoeticaApplication {
	public static void main(String[] args) {
		System.out.println("Starting Poetica. Version " + AppVersion.CURRENT_VERSION);
		SpringApplication.run(PoeticaApplication.class, args);
	}

	@Bean
	public Configuration configuration() {
		return new Configuration();
	}
}
