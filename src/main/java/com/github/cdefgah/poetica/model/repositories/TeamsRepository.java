/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.model.repositories;

import com.github.cdefgah.poetica.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


/**
 * Репозиторий для работы с командами.
 */
@Repository
public interface TeamsRepository extends JpaRepository<Team, Long> {

}
