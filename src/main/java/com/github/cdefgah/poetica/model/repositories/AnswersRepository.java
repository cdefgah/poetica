/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2022 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.model.repositories;

import com.github.cdefgah.poetica.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Репозиторий для работы с ответами на задания.
 */
@Repository
public interface AnswersRepository extends JpaRepository<Answer, Long> {

}
