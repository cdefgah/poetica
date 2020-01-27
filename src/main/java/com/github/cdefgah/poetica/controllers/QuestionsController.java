package com.github.cdefgah.poetica.controllers;

import com.github.cdefgah.poetica.model.Answer;
import com.github.cdefgah.poetica.model.Question;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

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
     * Менеджер сущностей для взаимоедйствия с базой данных.
     */
    @Autowired
    EntityManager entityManager;


    @RequestMapping(path = "/questions/model-constraints", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Map<String, Integer>> getModelConstraints() {
        return new ResponseEntity<>(Question.getModelConstraintsMap(), HttpStatus.OK);
    }

    /**
     * Добавляет вопрос (бескрылку) в базу.
     * @param questionNumber уникальный номер вопроса (бескрылки).
     * @param questionBody содержимое вопроса (бескрылки).
     * @param isCredited true, если вопрос (бескрылка) зачётный.
     * @param source источник вопроса (бескрылки).
     * @param comment комментарий к вопросу (бескрылке) от создателя этого вопроса.
     * @return Http CREATED вместе с идентификатором добавленного вопроса. Иначе - код http ошибки + сообщение.
     */
    @RequestMapping(path = "/questions", method = RequestMethod.POST,
            consumes = "application/x-www-form-urlencoded",
            produces = "application/json")
    public ResponseEntity<String> addNewQuestion(@RequestParam("questionNumber") int questionNumber,
                                                 @RequestParam("questionBody") String questionBody,
                                                 @RequestParam("isCredited") boolean isCredited,
                                                 @RequestParam("source") String source,
                                                 @RequestParam("comment") String comment) {
        if (questionNumber <= 0) {
            return new ResponseEntity<>("Номер вопроса должен быть положительным числом.",
                    HttpStatus.BAD_REQUEST);
        }

        if (!isQuestionNumberUnique(questionNumber)) {
            return new ResponseEntity<>("Номер вопроса должен быть уникальным: " + questionNumber,
                    HttpStatus.BAD_REQUEST);
        }

        if (isStringEmpty(questionBody)) {
            return new ResponseEntity<>("Содержание вопроса не может быть пустым", HttpStatus.BAD_REQUEST);
        }

        if (isStringEmpty(source)) {
            return new ResponseEntity<>("Источник вопроса не может быть пустым", HttpStatus.BAD_REQUEST);
        }

        Question question = new Question();
        question.setNumber(questionNumber);
        question.setBody(questionBody);
        question.setCredited(isCredited);
        question.setSource(source);
        question.setComment(comment);

        entityManager.persist(question);
        return new ResponseEntity<>(String.valueOf(question.getId()), HttpStatus.CREATED);
    }

    /**
     * Обновляет содержимое вопроса (бескрылки).
     * Номер вопроса и признак 'зачётный/незачётный вопрос' обновлению не подлежат.
     * @param questionId уникальный идентификатор вопроса (бескрылки), который надо обновить.
     * @param newQuestionBody новое содержимое вопроса, если содержимое обновлять не надо, передаётся пустым.
     * @param newSource новый источник вопроса, если источник обновлять не надо, передаётся пустым.
     * @param updateComment true, если надо обновить комментарий. В противном случае параметр newComment во внимание
     *                      не принимается.
     * @param newComment новый комментарий к вопросу, принимается во внимание только если updateComment равен true.
     * @return Http OK если всё в порядке, иначе http-код ошибки + сообщение.
     */
    @RequestMapping(path = "/questions/{questionId}", method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<String> updateQuestion(@PathVariable long questionId,
                                                 @RequestParam("newQuestionBody") String newQuestionBody,
                                                 @RequestParam("newSource") String newSource,
                                                 @RequestParam("updateComment") boolean updateComment,
                                                 @RequestParam("newComment") String newComment) {

        boolean updateBody = !isStringEmpty(newQuestionBody);
        boolean updateSource = !isStringEmpty(newSource);

        if (!updateBody && !updateSource && !updateComment) {
            return new ResponseEntity<>("Судя по переданным параметрам, ни одно из разрешённых " +
                    "к обновлению свойств вопроса не обновляется.",
                    HttpStatus.BAD_REQUEST);
        }

        Question question = entityManager.find(Question.class, questionId);
        if (question == null) {
            return new ResponseEntity<>("Не удалось найти вопрос (бескрылку) " +
                    "с указанным идентификатором:  " + questionId,
                    HttpStatus.NOT_FOUND);
        }

        if (updateBody) {
            question.setBody(newQuestionBody);
        }

        if (updateSource) {
            question.setSource(newSource);
        }

        if (updateComment) {
            question.setComment(newComment);
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

        return new ResponseEntity<>(query.getResultList(), HttpStatus.OK);
    }

    /**
     * Возвращает список зачётных вопросов.
     * @return HTTP OK и список зачётных вопросов.
     */
    @RequestMapping(path = "/questions/credited", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<List<Question>> getCreditedQuestions() {
        return new ResponseEntity<>(getQuestionsList(true), HttpStatus.OK);
    }

    /**
     * Возвращает список внезачётных вопросов.
     * @return HTTP OK и список внезачётных вопросов.
     */
    @RequestMapping(path = "/questions/not-credited", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<List<Question>> getNotCreditedQuestions() {
        return new ResponseEntity<>(getQuestionsList(false), HttpStatus.OK);
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
            return new ResponseEntity<>(question, HttpStatus.OK);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Удаляет вопрос. На вопрос не должно быть дано ответов.
     * @param questionId уникальный идентификатор вопроса.
     * @return Http NO CONTENT, если всё в порядке, в случае ошибки вернёт соответствующий код http с сообщением.
     */
    @RequestMapping(path = "/questions/{questionId}", method = RequestMethod.DELETE, produces = "application/json")
    public ResponseEntity<String> deleteQuestion(@PathVariable long questionId) {
        if (thisQuestionIsNotAnsweredYet(questionId)) {
            Query deletionQuery = entityManager.createQuery("delete from Question q where q.id=:questionId");
            final int deletedCount = deletionQuery.setParameter("questionId", questionId).executeUpdate();
            if (deletedCount > 0) {
                return ResponseEntity.noContent().build();
            } else {
                return new ResponseEntity<>("Не удалось удалить вопрос с идентификатором: " + questionId,
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            return new ResponseEntity<>("Нельзя удалить вопрос, так как на него уже есть ответы.",
                    HttpStatus.BAD_REQUEST);
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
                if (!thisQuestionIsNotAnsweredYet(question.getId())) {
                    return new ResponseEntity<>("Нельзя удалить все вопросы," +
                            " так есть как минимум один вопрос, на который внесены ответы.",
                            HttpStatus.BAD_REQUEST);
                }
            }

            Query deletionQuery = entityManager.createQuery("delete from Question q");
            deletionQuery.executeUpdate();
        }

        return ResponseEntity.noContent().build();
    }

    /**
     * Возвращает true, если на вопрос нет ответов в системе.
     * @param questionId уникальный идентификатор вопроса.
     * @return true, если на вопрос нет ответов в системе.
     */
    private boolean thisQuestionIsNotAnsweredYet(long questionId) {
        Query query = entityManager.createQuery("from Answer a where a.questionId=:questionId", Answer.class);
        query.setParameter("questionId", questionId);
        return !query.getResultList().isEmpty();
    }

    /**
     * Возвращает список вопросов (бескрылок).
     * @param onlyCreditedQuestions true, если мы запрашиваем список зачётных вопросов (бескрылок).
     *                                  Для внезачётных - false.
     * @return список запрошенных вопросов (бескрылок).
     */
    private List<Question> getQuestionsList(boolean onlyCreditedQuestions) {
        TypedQuery<Question> query =
                entityManager.createQuery("select question from Question " +
                        "question where question.isCredited=:isCredited", Question.class);
        query.setParameter("isCredited", onlyCreditedQuestions);
        return query.getResultList();
    }


    /**
     * Возвращает true, если номер вопроса уникальный и в базе нет вопроса с таким-же номером.
     * @param questionNumber номер вопроса для проверки.
     * @return true, если номер вопроса уникальный и в базе нет вопроса с таким-же номером.
     */
    private boolean isQuestionNumberUnique(int questionNumber) {
        Query query = entityManager.createQuery("from Question q where q.number=:questionNumber",
                Question.class);
        query.setParameter("questionNumber", questionNumber);
        return query.getResultList().isEmpty();
    }
}