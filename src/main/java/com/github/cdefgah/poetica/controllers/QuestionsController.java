package com.github.cdefgah.poetica.controllers;

import com.github.cdefgah.poetica.model.Answer;
import com.github.cdefgah.poetica.model.Question;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import java.util.List;
import java.util.Map;

/**
 * Обрабатывает все запросы относительно непосредственной работы с вопросами (бескрылками).
 */
@RestController
@Transactional
public class QuestionsController extends AbstractController {

    /**
     * Менеджер сущностей для взаимодействия с базой данных.
     */
    @Autowired
    private EntityManager entityManager;

    @RequestMapping(path = "/questions/model-constraints", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Map<String, String>> getModelConstraints() {
        return new ResponseEntity<>(Question.getModelConstraintsMap(), HttpStatus.OK);
    }

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
     * Обновляет содержимое вопроса (бескрылки).
     * Номер вопроса и признак 'зачётный/незачётный вопрос' обновлению не подлежат.
     * @param questionId уникальный идентификатор вопроса (бескрылки), который надо обновить.
     * @param newQuestionBody новое содержимое вопроса, если содержимое обновлять не надо, передаётся пустым.
     * @param newQuestionSource новый источник вопроса, если источник обновлять не надо, передаётся пустым.
     * @param updateComment true, если надо обновить комментарий. В противном случае параметр newComment во внимание
     *                      не принимается.
     * @param newQuestionComment новый комментарий к вопросу, принимается во внимание только если updateComment равен true.
     * @return Http OK если всё в порядке, иначе http-код ошибки + сообщение.
     */
    @RequestMapping(path = "/questions/{questionId}", method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<String> updateQuestion(@PathVariable long questionId,
                                                 @RequestParam("newQuestionTitle") String newQuestionTitle,
                                                 @RequestParam("updateGradedState") boolean updateGradedState,
                                                 @RequestParam("newGradedState") boolean newGradedState,
                                                 @RequestParam("newQuestionBody") String newQuestionBody,
                                                 @RequestParam("newQuestionSource") String newQuestionSource,
                                                 @RequestParam("updateComment") boolean updateComment,
                                                 @RequestParam("newQuestionComment") String newQuestionComment) {

        boolean updateTitle = !isStringEmpty(newQuestionTitle);
        boolean updateBody = !isStringEmpty(newQuestionBody);
        boolean updateSource = !isStringEmpty(newQuestionSource);
        boolean updateHasRequested = updateTitle || updateGradedState || updateBody || updateSource || updateComment;

        if (!updateHasRequested) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).
                    body(composeErrorMessage("Судя по переданным параметрам, ни одно из разрешённых " +
                    "к обновлению свойств вопроса не обновляется."));
        }

        Question question = entityManager.find(Question.class, questionId);
        if (question == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).
                    body(composeErrorMessage("Не удалось найти задание " +
                            "с указанным идентификатором:  " + questionId));
        }

        if (updateTitle) {
            question.setTitle(newQuestionTitle);
        }

        if (updateGradedState) {
            question.setGraded(newGradedState);
        }

        if (updateBody) {
            question.setBody(newQuestionBody);
        }

        if (updateSource) {
            question.setSource(newQuestionSource);
        }

        if (updateComment) {
            question.setComment(newQuestionComment);
        }

        entityManager.persist(question);
        return ResponseEntity.ok().build();
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