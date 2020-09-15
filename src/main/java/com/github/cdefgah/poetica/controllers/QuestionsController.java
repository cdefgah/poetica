/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.controllers;

import com.github.cdefgah.poetica.model.Answer;
import com.github.cdefgah.poetica.model.Question;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.persistence.Query;
import javax.persistence.TypedQuery;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Обрабатывает все запросы относительно непосредственной работы с вопросами (бескрылками).
 */
@RestController
@Transactional
public class QuestionsController extends AbstractController {

    @RequestMapping(path = "/questions/total-amount", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Long> getQuestionsTotalAmount() {
        TypedQuery<Long> query = entityManager.createQuery("select count(*) FROM Question question", Long.class);
        return new ResponseEntity<>(query.getSingleResult(), HttpStatus.OK);
    }

    /**
     * Отдаёт по запросу таблицу с максимальными размерами полей в модели данных.
     * @return таблица с максимальными размерами полей в модели данных.
     */
    @RequestMapping(path = "/questions/model-constraints", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Map<String, String>> getModelConstraints() {
        return new ResponseEntity<>(Question.getModelConstraintsMap(), HttpStatus.OK);
    }

    /**
     * Отдаёт максимальный номер зарегистрированного в системе задания.
     * @return максимальный номер зарегистрированного в системе задания.
     */
    @RequestMapping(path = "/questions/max-number", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Integer> getMaxQuestionNumber() {
        TypedQuery<Integer> query =
                entityManager.createQuery("select max(highestInternalNumber) " +
                                                                            "FROM Question question", Integer.class);

        return new ResponseEntity<>(query.getSingleResult(), HttpStatus.OK);
    }

    @RequestMapping(path = "/questions/import", method = RequestMethod.POST,
            consumes = "application/json",
            produces = "application/json")
     public ResponseEntity<String> importQuestions(@RequestBody Question[] allQuestions) {

        for(Question question: allQuestions) {
            entityManager.persist(question);
        }
        
        return new ResponseEntity<>("", HttpStatus.OK);
    }


    /**
     * Обновляет содержимое задания.
     * @param questionId уникальный идентификатор задания в базе данных.
     * @param updateQuestionTitle флаг, если true, то обновляем заголовок задания.
     * @param newQuestionTitle новый заголовок задания.
     * @param updateGradedState флаг, если true, то обновляем признак "Зачётный/Внезачётный" для задания.
     * @param newGradedState новое признак "Зачётный/Внезачётный" для задания.
     * @param newQuestionBody новое содержимое тела задания.
     * @param newAuthorsAnswer новое содержимое авторского ответа.
     * @param newQuestionSource новое содержимое блока информации об источнике для задания.
     * @param updateComment флаг, если true, обновляем комментарий к заданию.
     * @param newQuestionComment новое содержимое комментария к заданию.
     * @param newAuthorsInfo новое содержимое блока с информацией об авторе задания.
     * @return Если всё в порядке, ничего не возвращает кроме HTTP.OK.
     */
    @RequestMapping(path = "/questions/{questionId}", method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<String> updateQuestion(@PathVariable long questionId,
                                                 @RequestParam("updateQuestionTitle") boolean updateQuestionTitle,
                                                 @RequestParam("newQuestionTitle") String newQuestionTitle,
                                                 @RequestParam("updateGradedState") boolean updateGradedState,
                                                 @RequestParam("newGradedState") boolean newGradedState,
                                                 @RequestParam("newQuestionBody") String newQuestionBody,
                                                 @RequestParam("newAuthorsAnswer") String newAuthorsAnswer,
                                                 @RequestParam("newQuestionSource") String newQuestionSource,
                                                 @RequestParam("updateComment") boolean updateComment,
                                                 @RequestParam("newQuestionComment") String newQuestionComment,
                                                 @RequestParam("newAuthorsInfo") String newAuthorsInfo) {

        final boolean updateBody = !isStringEmpty(newQuestionBody);
        final boolean updateSource = !isStringEmpty(newQuestionSource);
        final boolean updateAuthorsAnswer = !isStringEmpty(newAuthorsAnswer);
        final boolean updateAuthorsInfo = !isStringEmpty(newAuthorsInfo);

        final boolean updateHasRequested = updateQuestionTitle || updateGradedState || updateBody
                                           || updateAuthorsAnswer || updateSource || updateComment || updateAuthorsInfo;

        if (!updateHasRequested) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).
                    body(composeErrorMessage("Судя по переданным параметрам, ни одно из разрешённых " +
                    "к обновлению свойств вопроса не обновляется."));
        }

        final Question question = entityManager.find(Question.class, questionId);
        if (question == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).
                    body(composeErrorMessage("Не удалось найти задание " +
                            "с указанным идентификатором:  " + questionId));
        }

        if (updateQuestionTitle) {
            question.setTitle(newQuestionTitle);
        }

        if (updateGradedState) {
            question.setGraded(newGradedState);
        }

        if (updateBody) {
            question.setBody(newQuestionBody);
        }

        if (updateAuthorsAnswer) {
            question.setAuthorsAnswer(newAuthorsAnswer);
        }

        if (updateSource) {
            question.setSource(newQuestionSource);
        }

        if (updateComment) {
            question.setComment(newQuestionComment);
        }

        if (updateAuthorsInfo) {
            question.setAuthorInfo(newAuthorsInfo);
        }

        entityManager.persist(question);
        return ResponseEntity.ok().build();
    }

    /**
     * Проверяет наличие зачётных заданий в системе.
     * @return возвращает true, если зачётные задания в системе представлены.
     */
    @RequestMapping(path = "/questions/graded-present", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Boolean> getGradedQuestionsPresent() {
        TypedQuery<Long> query =
                entityManager.createQuery("select count(*) from Question " +
                                                                "question where question.graded=:graded", Long.class);
        query.setParameter("graded", true);
        return ResponseEntity.status(HttpStatus.OK).body(query.getSingleResult() > 0);
    }

    /**
     * Возвращает список всех вопросов (бескрылок), и зачётных и внезачётных.
     * @return HTTP OK и список всех вопросов.
     */
    @RequestMapping(path = "/questions/all", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<List<Question>> getAllQuestions() {
        TypedQuery<Question> query =
                entityManager.createQuery("select question from Question question", Question.class);

        return ResponseEntity.status(HttpStatus.OK).body(query.getResultList());
    }

    /**
     * Возвращает список зачётных вопросов.
     * @return HTTP OK и список зачётных вопросов.
     */
    @RequestMapping(path = "/questions/credited", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<List<Question>> getCreditedQuestions() {
        return ResponseEntity.status(HttpStatus.OK).body(getQuestionsList(true));
    }

    /**
     * Возвращает список внезачётных вопросов.
     * @return HTTP OK и список внезачётных вопросов.
     */
    @RequestMapping(path = "/questions/not-credited", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<List<Question>> getNotCreditedQuestions() {
        return ResponseEntity.status(HttpStatus.OK).body(getQuestionsList(false));
    }

    /**
     * Возвращает данные по вопросу (бескрылке) по его уникальному идентификатору.
     * @param questionId уникальный идентификатор вопроса.
     * @return HTTP OK и данные по вопросу, либо HTTP NOT FOUND если вопрос не найден.
     */
    @RequestMapping(path = "/questions/{questionId}", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Question> getQuestionById(@PathVariable long questionId) {
        Question question = entityManager.find(Question.class, questionId);
        if (question != null) {
            return ResponseEntity.status(HttpStatus.OK).body(question);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Удаляет все вопросы из базы. Ни на один вопрос не должно быть дано ответов.
     * Иначе операция завершится с ошибкой.
     * @return Http NO CONTENT если всё прошло успешно, иначе http код ошибки и сообщение об ошибке.
     */
    @RequestMapping(path = "/questions/all", method = RequestMethod.DELETE, produces = "application/json")
    public ResponseEntity<String> deleteAllQuestions() {
        ResponseEntity<List<Question>> allQuestionsResponseObject = getAllQuestions();
        List<Question> questionsList = allQuestionsResponseObject.getBody();
        if (questionsList != null && !questionsList.isEmpty()) {
            for (Question question : questionsList) {
                if (thisQuestionIsAnswered(question.getId())) {
                    return new ResponseEntity<>(composeErrorMessage("Нельзя удалить все вопросы," +
                            " так есть как минимум один вопрос (номер вопроса: " + question.getExternalNumber()
                            +"), на который внесены ответы."),
                            HttpStatus.BAD_REQUEST);
                }
            }

            Query deletionQuery = entityManager.createQuery("delete from Question q");
            deletionQuery.executeUpdate();
        }

        return ResponseEntity.noContent().build();
    }

    /**
     * Экспортирует список заданий (в формате механизма для их импорта).
     * @return текстовый файл с эскпортируемыми заданиями в формате импортера заданий.
     */
    @RequestMapping(path = "/questions/export", method = RequestMethod.GET)
    public ResponseEntity<Resource> exportQuestions() {

        TypedQuery<Question> query = entityManager.
                                        createQuery("select question from Question question", Question.class);

        List<Question> allQuestions = query.getResultList();

        StringBuilder payload = new StringBuilder();
        for (Question question: allQuestions) {
            payload.append(question.getTextRepresentationForImporter()).append('\n');
        }

        String fileName = "exportedQuestions_" + this.getTimeStampPartForFileName()  +".txt";
        HttpHeaders header = this.getHttpHeaderForGeneratedFile(fileName);

        ByteArrayResource resource = new ByteArrayResource(payload.toString().getBytes(StandardCharsets.UTF_8));

        return ResponseEntity.ok()
                .headers(header)
                .contentLength(resource.contentLength())
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(resource);
    }

    /**
     * Возвращает true, если на вопрос дан ответ.
     * @param questionId уникальный идентификатор вопроса.
     * @return true, если на вопрос дан ответ в системе.
     */
    private boolean thisQuestionIsAnswered(long questionId) {
        Query query = entityManager.createQuery("from Answer a where a.questionId=:questionId", Answer.class);
        query.setParameter("questionId", questionId);
        return !query.getResultList().isEmpty();
    }

    /**
     * Возвращает список вопросов (бескрылок).
     * @param onlyGradedQuestions true, если мы запрашиваем список зачётных вопросов (бескрылок).
     *                                  Для внезачётных - false.
     * @return список запрошенных вопросов (бескрылок).
     */
    private List<Question> getQuestionsList(boolean onlyGradedQuestions) {
        TypedQuery<Question> query =
                entityManager.createQuery("select question from Question " +
                        "question where question.graded=:graded", Question.class);
        query.setParameter("graded", onlyGradedQuestions);
        return query.getResultList();
    }
}