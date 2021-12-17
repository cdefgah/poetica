/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica;

import com.github.cdefgah.poetica.model.Answer;
import com.github.cdefgah.poetica.model.Question;
import com.github.cdefgah.poetica.model.config.Configuration;
import com.github.cdefgah.poetica.utils.AppVersion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import javax.annotation.PostConstruct;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.util.List;

/**
 * Главный класс приложения.
 */
@SpringBootApplication
public class PoeticaApplication {

	/**
	 * Менеджер сущностей для взаимодействия с базой данных.
	 */
	@Autowired
	EntityManager entityManager;

	/**
	 * Точка входа в приложение.
	 * @param args параметры запуска приложения.
	 */
	public static void main(String[] args) {
		System.out.println("Starting Poetica. Version " + AppVersion.CURRENT_VERSION);
		SpringApplication.run(PoeticaApplication.class, args);
	}

	/**
	 * Отдаёт информацию о конфигурации приложения.
	 * @return информация о конфигурации приложения.
	 */
	@SuppressWarnings("InstantiationOfUtilityClass")
	@Bean
	public Configuration configuration() {
		return new Configuration();
	}

	/**
	 * Этот метод автоматически вызывается при запуске приложения, обрабатывает ситуации,
	 * когда приложение запущено с базой, созданной в предыдущей версии Poetica.
	 */
	@PostConstruct
	private void updateDatabaseState() {
		updateAuthorsAnswerHashForQuestions();
		updateAnswerBodyHashForAnswers();
	}

	private void updateAuthorsAnswerHashForQuestions() {
		System.out.println("Updating questions without author's answer hash...");
		TypedQuery<Long> questionsQuery = entityManager.createQuery("select question.id from " +
				"Question question where question.authorsAnswerHash is NULL", Long.class);

		List<Long> foundQuestionIds = questionsQuery.getResultList();
		if (foundQuestionIds.size() > 0) {
			updateAuthorsAnswerHashForQuestions(foundQuestionIds);
		}
	}

	private void updateAnswerBodyHashForAnswers() {
		System.out.println("Updating answers without answer body hash...");
		TypedQuery<Long> answersQuery = entityManager.createQuery("select answer.id from " +
				"Answer answer where answer.answerBodyHash is NULL", Long.class);

		List<Long> foundAnswerIds = answersQuery.getResultList();
		if (foundAnswerIds.size() > 0) {
			updateAnswerBodyHashForAnswers(foundAnswerIds);
		}
	}

	/**
	 * Обновляет хэш для авторского ответа в заданиях.
	 * @param questionIdsList список уникальных идентификаторов заданий (вопросов),
	 *                        в которых не задан хэш-код для авторского ответа.
	 */
	private void updateAuthorsAnswerHashForQuestions(List<Long> questionIdsList) {
		for(long questionId : questionIdsList) {
			Question oneProcessingQuestion = entityManager.find(Question.class, questionId);
			if (oneProcessingQuestion != null) {
				oneProcessingQuestion.buildAndSetAuthorsAnswerHash();
				entityManager.persist(oneProcessingQuestion);
			} else {
				// управление не должно сюда сваливаться, но если вдруг такое произойдет, значит база сломалась
				throw new RuntimeException("Unable to find question by id: " + questionId);
			}
		}
	}

	/**
	 * Обновляет хэш для тела ответа в объектах Ответ.
	 * @param answerIdsList список уникальных идентификаторов ответов, в которых не задан хэш-код для тела ответа.
	 */
	private void updateAnswerBodyHashForAnswers(List<Long> answerIdsList) {
		for(long answerId : answerIdsList) {
			Answer oneProcessingAnswer = entityManager.find(Answer.class, answerId);
			if (oneProcessingAnswer != null) {
				oneProcessingAnswer.buildAndSetAnswerBodyHash();
				entityManager.persist(oneProcessingAnswer);
			} else {
				// выполнение сюда не должно свалиться, но если вдруг,
				// мы не дадим этому знаменательному событию пройти втихую
				throw new RuntimeException("Unable to find answer by id: " + answerId);
			}
		}
	}
}
