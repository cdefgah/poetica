/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 - 2021 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.controllers;

import com.github.cdefgah.poetica.model.Answer;
import com.github.cdefgah.poetica.model.Grade;

import com.github.cdefgah.poetica.model.Question;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.PostConstruct;
import javax.persistence.NoResultException;
import javax.persistence.TypedQuery;
import java.util.List;
import java.util.Map;
import java.util.Optional;


/**
 * Контроллер для обработки запросов с ответами на задания.
 */
@RestController
@Transactional
public class AnswersController extends AbstractController {

    /**
     * Отдаёт по запросу таблицу с максимальными размерами полей в модели данных.
     * @return таблица с максимальными размерами полей в модели данных.
     */
    @RequestMapping(path = "/answers/model-constraints", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Map<String, String>> getModelConstraints() {
        return new ResponseEntity<>(Answer.getModelConstraintsMap(), HttpStatus.OK);
    }


    /**
     * Импортирует ответы в базу данных.
     * @param answersToImport массив с ответами.
     * @return Если всё прошло нормально, возвращает пустую строку и HTTP.OK. В случае ошибки возвращает
     * строку с текстом ошибки и HTTP.BAD_REQUEST.
     */
    @RequestMapping(path = "/answers/import", method = RequestMethod.POST,
            consumes = "application/json",
            produces = "application/json")
    public ResponseEntity<String> importAnswers(@RequestBody Answer[] answersToImport) {

        for(Answer oneAnswer: answersToImport) {
            Optional<Long> questionIdInfo = getQuestionIdByQuestionNumber(oneAnswer.getQuestionNumber());
            if (questionIdInfo.isPresent()) {
                oneAnswer.setQuestionId(questionIdInfo.get());
                assignGradeAutomaticallyIfPossible(oneAnswer);

                entityManager.persist(oneAnswer);
            } else {
                return new ResponseEntity<>(composeErrorMessage("В базе данных не удалось найти вопрос с номером: " +
                                                            oneAnswer.getQuestionNumber()), HttpStatus.BAD_REQUEST);
            }
        }

        return new ResponseEntity<>("", HttpStatus.OK);
    }

    /**
     * Пытается проставить оценку импортируемому ответу автоматически.
     * Сперва проверяем на совпадение с авторским ответом в соответствующем ответу задании.
     * Если совпадение есть, то ответу засчитывается зачёт (+), если нет, идёт поиск среди ответов,
     * уже получивших оценку. Если найден ответ с оценкой, то обрабатываемому ответу даём ту-же оценку,
     * что и в найденном ответе.
     * @param answer Объект ответа, для которого надо попробовать дать автоматическую оценку.
     */
    private void assignGradeAutomaticallyIfPossible(Answer answer) {
        long questionId = answer.getQuestionId();
        Question question = getQuestionById(questionId);
        rebuildAnswerHashWhenNecessary(question, answer);

        if (answer.getAnswerBodyHash().equals(question.getAuthorsAnswerHash())) {
            // если ответ совпадает с авторским ответом, засчитываем ответ и выходим
            answer.setGrade(Grade.Accepted);
            return;
        }

        attemptToGradeViaCheckingOtherGradedAnswers(answer);
    }

    /**
     * Отдаёт объект вопроса по id.
     * @param questionId id вопроса.
     * @return объект вопроса.
     */
    private Question getQuestionById(long questionId) {
        Question question = entityManager.find(Question.class, questionId);
        if (question == null) {
            // этого не может произойти, но если вдруг, мы бросаем RuntimeException().
            throw new RuntimeException("Unable to find question by id: " + questionId);
        }

        return question;
    }

    /**
     * Перестраивает hash-коды вопроса и ответа, если есть необходимость.
     * @param question объект вопроса.
     * @param answer объект ответа.
     */
    private void rebuildAnswerHashWhenNecessary(Question question, Answer answer) {
        if (!answer.IsAnswerBodyHashPresent()) {
            answer.buildAndSetAnswerBodyHash();
        }

        if (!question.IsAuthorsAnswerHashPresent()) {
            question.buildAndSetAuthorsAnswerHash();
        }
    }

    /**
     * Проверяет все оцененные ответы на тот-же вопрос, на который дан ответ в объекте, переданном в параметре.
     * Если найдётся совпадение, то переданный в параметре ответ получает ту-же оценку, что и в найденном ответе.
     * @param answer объект ответа.
     */
    private void attemptToGradeViaCheckingOtherGradedAnswers(Answer answer) {

        // ищем id оцененных ответов на этот-же вопрос, у которых совпадает hash-код ответа
        TypedQuery<Long> query = entityManager.createQuery("select answer.id from " +
                                                            "Answer answer where answer.grade<>:grade " +
                                                            "and answer.questionId=:questionId " +
                                                            "and answer.answerBodyHash=:answerBodyHash", Long.class);

        query.setParameter("grade", Grade.None);
        query.setParameter("questionId", answer.getQuestionId());
        query.setParameter("answerBodyHash", answer.getAnswerBodyHash());

        List<Long> resultList = query.getResultList();
        if (resultList.size() == 0) {
            // если ничего не нашли, просто выходим
            return;
        }

        // если наши, то берем первый id ответа
        long foundGradedAnswerId = resultList.get(0);
        Answer foundGradedAnswer = entityManager.find(Answer.class, foundGradedAnswerId);
        if (foundGradedAnswer == null) {
            // этого не может произойти, но если вдруг, мы бросаем RuntimeException().
            throw new RuntimeException("Unable to find answer by id: " + foundGradedAnswerId);
        }

        // выставляем ту-же оценку, что и у найденного ответа
        answer.setGrade(foundGradedAnswer.getGrade());
    }

    /**
     * Отдаёт все ответы для указанной команды и раунда.
     * @param teamId идентификатор команды.
     * @param roundOption номер раунда. Если передан 0 - то забираем всё.
     * @return список ответов.
     */
    @RequestMapping(path = "/answers/{teamId}/{roundOption}", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<List<Answer>> getAnswers(@PathVariable long teamId, @PathVariable int roundOption) {
        TypedQuery<Answer> query;

        if (roundOption == 0) {
            // нужны все ответы
            query = entityManager.createQuery("select answer from Answer answer where answer.teamId=:teamId",
                    Answer.class);
            query.setParameter("teamId", teamId);
        } else {
            // нужны ответы на определенный тур (раунд)
            query = entityManager.createQuery("select answer from Answer answer where " +
                                                            "answer.teamId=:teamId and answer.roundNumber=:roundNumber",
                    Answer.class);
            query.setParameter("teamId", teamId);
            query.setParameter("roundNumber", roundOption);
        }

        return ResponseEntity.status(HttpStatus.OK).body(query.getResultList());
    }

    /**
     * Проверяет, есть-ли в базе хотя-бы один ответ.
     * @return true, если есть, false - в противном случае.
     */
    @RequestMapping(path = "/answers/present", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Boolean> areAnswersPresent() {
        TypedQuery<Long> query = entityManager.createQuery("select count(*) FROM Email email", Long.class);
        return ResponseEntity.status(HttpStatus.OK).body(query.getSingleResult() > 0);
    }

    /**
     * Отдаёт ответ по запросу, по его уникальному идентификатору.
     * @param answerId уникальный идентификатор ответа.
     * @return объект ответа, если найден вместе с HTTP.OK. Если не найден, то возвращается HTTP.NOT_FOUND.
     */
    @RequestMapping(path = "/answers/{answerId}", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Answer> getAnswerById(@PathVariable long answerId) {
        Answer answer = entityManager.find(Answer.class, answerId);
        if (answer != null) {
            return ResponseEntity.status(HttpStatus.OK).body(answer);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Помечает ответ как принятый (зачтённый).
     * @param answerId уникальный идентифкатор ответа в базе данных.
     * @return возвращает HTTP.OK если всё в порядке. Иначе возвращает NOT_FOUND, если не удалось найти ответ
     * по переданному в параметрах запроса идентификатору.
     */
    @RequestMapping(path = "/answers/accept", method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<String> acceptAnswer(@RequestParam("answerId") long answerId) {
        Answer answer = entityManager.find(Answer.class, answerId);
        if (answer == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).
                    body(composeErrorMessage("Не удалось найти ответ " +
                            "с указанным идентификатором:  " + answerId));
        }

        answer.setGrade(Grade.Accepted);
        entityManager.persist(answer);
        return ResponseEntity.ok().build();
    }

    /**
     * Помечает ответ как не принятый (не зачтённый).
     * @param answerId уникальный идентифкатор ответа в базе данных.
     * @return возвращает HTTP.OK если всё в порядке. Иначе возвращает NOT_FOUND, если не удалось найти ответ
     * по переданному в параметрах запроса идентификатору.
     */
    @RequestMapping(path = "/answers/decline", method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<String> declineAnswer(@RequestParam("answerId") long answerId) {
        Answer answer = entityManager.find(Answer.class, answerId);
        if (answer == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).
                    body(composeErrorMessage("Не удалось найти ответ " +
                            "с указанным идентификатором:  " + answerId));
        }

        answer.setGrade(Grade.NotAccepted);
        entityManager.persist(answer);
        return ResponseEntity.ok().build();
    }

    /**
     * Проверяет наличие ответов без оценок в базе.
     * @return Возвращает строку с id первой найденной команды, для которой занесены не все оценки к ответам.
     * Если нет ответов без оценок, возвращается пустая строка.
     */
    @RequestMapping(path = "/answers/not-graded-presence", method = RequestMethod.GET)
    public ResponseEntity<String> notGradedAnswersPresent() {
        TypedQuery<Long> query = entityManager.createQuery("select distinct answer.teamId from " +
                                                                "Answer answer where answer.grade=:grade", Long.class);
        query.setParameter("grade", Grade.None);
        List<Long> resultList = query.getResultList();
        String foundTeamId = "";
        if (resultList != null && resultList.size() > 0) {
            foundTeamId = resultList.get(0).toString();
        }

        return ResponseEntity.status(HttpStatus.OK).body(foundTeamId);
    }

    /**
     * Проверяет наличие ответов без оценок в базе для конкретной команды.
     * @return Возвращает строку с символом 1, если ответы без оценок есть.
     * Если нет ответов без оценок, возвращается пустая строка.
     */
    @RequestMapping(path = "/answers/not-graded-presence/{teamId}", method = RequestMethod.GET)
    public ResponseEntity<String> notGradedAnswersPresentForTeam(@PathVariable long teamId) {
        TypedQuery<Long> query = entityManager.createQuery("select count(*) from " +
                                     "Answer answer where answer.teamId=:teamId and answer.grade=:grade", Long.class);
        query.setParameter("teamId", teamId);
        query.setParameter("grade", Grade.None);
        final long answersFound = query.getSingleResult();
        final String resultValue = answersFound > 0 ? "1" : "";
        return ResponseEntity.status(HttpStatus.OK).body(resultValue);
    }

    /**
     * Получает уникальный идентификатор вопроса (задания) по его номеру.
     * @param questionNumber номер задания.
     * @return Если найден, то возвращает уникальный идентификатор задания, обёрнутый в Optional.
     * Если не найден, то возвращает Optional.empty().
     */
    private Optional<Long> getQuestionIdByQuestionNumber(int questionNumber) {
        TypedQuery<Long> query =
                entityManager.createQuery("select id FROM Question question WHERE " +
                        "question.lowestInternalNumber<=:requestedQuestionNumber AND " +
                        "question.highestInternalNumber>=:requestedQuestionNumber", Long.class);

        query.setParameter("requestedQuestionNumber", questionNumber);

        try {
            return Optional.of(query.getSingleResult());

        } catch(NoResultException noResultException) {
            // сюда управление в принципе не может быть передано, но мы обрабатываем всё равно
            return Optional.empty();
        }
    }

    /**
     * Этот метод автоматически вызывается при запуске приложения, обрабатывает ситуации,
     * когда приложение запущено с базой, созданной в предыдущей версии Poetica.
     */
    @PostConstruct
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
