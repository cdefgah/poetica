package com.github.cdefgah.poetica.utils;

import com.github.cdefgah.poetica.model.Answer;
import com.github.cdefgah.poetica.model.Question;
import com.github.cdefgah.poetica.model.config.Configuration;
import com.github.cdefgah.poetica.model.config.ConfigurationRecord;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.transaction.Transactional;
import java.util.List;

/**
 * Используется для выполнения действий во время инициализации приложения.
 */
@Component
public class AppInitializer {

    /**
     * Для связи с базой данных.
     */
    @PersistenceContext
    EntityManager entityManager;

    /**
     * Инициализация базы данных.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initializeDatabase() {
        // Выставляем значения по-умолчанию в конфигурации, если нужно.
        setupConfigurationDefaults();

        // Обновляем пустые поля в таблицах на тот случай, если база была создана в предыдущей версии приложения.
        updateAuthorsAnswerHashForQuestions();
        updateAnswerBodyHashForAnswers();
    }

    private void setupConfigurationDefaults() {
        final String DEFAULT_GRADED_QUESTION_BACKGROUND_COLOR = "#FFFFFF";
        final String DEFAULT_NON_GRADED_QUESTION_BACKGROUND_COLOR = "#C0E6E9";

        System.out.println("Setup configuration defaults...");
        ConfigurationRecord gradedQuestionBackgroundColor = entityManager.find(ConfigurationRecord.class,
                                                            Configuration.CONFIG_KEY_GRADED_QUESTION_BACKGROUND_COLOR);

        if (gradedQuestionBackgroundColor == null) {
            gradedQuestionBackgroundColor = new ConfigurationRecord();
            gradedQuestionBackgroundColor.setKey(Configuration.CONFIG_KEY_GRADED_QUESTION_BACKGROUND_COLOR);
            gradedQuestionBackgroundColor.setValue(DEFAULT_GRADED_QUESTION_BACKGROUND_COLOR);
            entityManager.persist(gradedQuestionBackgroundColor);
        }

        ConfigurationRecord nonGradedQuestionBackgroundColor = entityManager.find(ConfigurationRecord.class,
                            Configuration.CONFIG_KEY_NON_GRADED_QUESTION_BACKGROUND_COLOR);
        if (nonGradedQuestionBackgroundColor == null) {
            nonGradedQuestionBackgroundColor = new ConfigurationRecord();
            nonGradedQuestionBackgroundColor.setKey(Configuration.CONFIG_KEY_NON_GRADED_QUESTION_BACKGROUND_COLOR);
            nonGradedQuestionBackgroundColor.setValue(DEFAULT_NON_GRADED_QUESTION_BACKGROUND_COLOR);
            entityManager.persist(nonGradedQuestionBackgroundColor);
        }

        System.out.println("Setup configuration defaults... done");
    }

    /**
     * Обновляет вопросы без хэша для авторского ответа.
     */
    private void updateAuthorsAnswerHashForQuestions() {
        System.out.println("Updating questions without author's answer hash...");
        TypedQuery<Long> questionsQuery = entityManager.createQuery("select question.id from " +
                "Question question where question.authorsAnswerHash is NULL", Long.class);

        List<Long> foundQuestionIds = questionsQuery.getResultList();
        if (foundQuestionIds.size() > 0) {
            updateAuthorsAnswerHashForQuestions(foundQuestionIds);
        }
        System.out.println("Updating questions without author's answer hash... done");
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
     * Этот метод автоматически вызывается при запуске приложения, обрабатывает ситуации,
     * когда приложение запущено с базой, созданной в предыдущей версии Poetica.
     */
    private void updateAnswerBodyHashForAnswers() {
        System.out.println("Updating answers without answer body hash...");
        TypedQuery<Long> answersQuery = entityManager.createQuery("select answer.id from " +
                "Answer answer where answer.answerBodyHash is NULL", Long.class);

        List<Long> foundAnswerIds = answersQuery.getResultList();
        if (foundAnswerIds.size() > 0) {
            updateAnswerBodyHashForAnswers(foundAnswerIds);
        }
        System.out.println("Updating answers without answer body hash... done");
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
