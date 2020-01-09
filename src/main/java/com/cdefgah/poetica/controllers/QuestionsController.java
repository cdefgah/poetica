package com.cdefgah.poetica.controllers;

import com.cdefgah.poetica.model.Answer;
import com.cdefgah.poetica.model.Question;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import java.util.List;

/**
 * Handles question-related REST requests.
 */
@RestController
@Transactional
public class QuestionsController extends AbstractController {

    /**
     * Entity manager that works with the underlying database.
     */
    @Autowired
    EntityManager entityManager;

    /**
     * Adds new question entity to the database.
     * @param questionNumber unique question number.
     * @param questionBody question body.
     * @param isOutOfCompetition if the question is out of competition, then pass true, false otherwise.
     * @return if operation succeed returns HTTP CREATED with the unique id
     * (don't confuse it with the questionNumber) of the created question.
     */
    @RequestMapping(path = "/questions", method = RequestMethod.POST,
            consumes = "application/x-www-form-urlencoded",
            produces = "application/json")
    public ResponseEntity<String> addNewQuestion(@RequestParam("questionNumber") String questionNumber,
                                               @RequestParam("questionBody") String questionBody,
                                               @RequestParam("isOutOfCompetition") boolean isOutOfCompetition) {
        if (isStringEmpty(questionNumber)) {
            return new ResponseEntity<>("Question number is not provided", HttpStatus.BAD_REQUEST);
        }

        if (!isQuestionNumberUnique(questionNumber, isOutOfCompetition)) {
            return new ResponseEntity<>("Question number is not unique: " + questionNumber,
                    HttpStatus.BAD_REQUEST);
        }

        if (isStringEmpty(questionBody)) {
            return new ResponseEntity<>("Question body is not provided", HttpStatus.BAD_REQUEST);
        }

        Question question = new Question();
        question.setNumber(questionNumber);
        question.setBody(questionBody);
        question.setOutOfCompetition(isOutOfCompetition);
        entityManager.persist(question);
        return new ResponseEntity<>(String.valueOf(question.getId()), HttpStatus.CREATED);
    }

    /**
     * Gets list of all existing competitive questions.
     * @return HTTP OK and the list of all existing competitive questions.
     */
    @RequestMapping(path = "/competitive-questions", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<List<Question>> getAllCompetitiveQuestions() {
        return new ResponseEntity<>(getListOfAllQuestions(false), HttpStatus.OK);
    }

    /**
     * Gets list of all existing non-competitive questions.
     * @return HTTP OK and the list of all existing non-competitive questions.
     */
    @RequestMapping(path = "/non-competitive-questions", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<List<Question>> getAllNonCompetitiveQuestions() {
        return new ResponseEntity<>(getListOfAllQuestions(true), HttpStatus.OK);
    }

    /**
     * Gets question by its unique id.
     * @param questionId unique question id.
     * @return HTTP OK and the found question entity in json format, or HTTP NOT FOUND if entity was not found.
     */
    @RequestMapping(path = "/questions/{questionId}", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Question> getQuestionById(@PathVariable long questionId) {
        Question question = entityManager.find(Question.class, questionId);
        if (question != null) {
            return new ResponseEntity<>(question, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Updates the question entity.
     * @param questionId unique id of a question to be updated.
     * @param newQuestionNumber new question number.
     * @param newQuestionBody new question body.
     * @return HTTP OK if the operation succeed, otherwise returns relevant http error code and error message.
     */
    @RequestMapping(path = "/questions/{questionId}", method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<String> updateQuestion(@PathVariable long questionId,
                                           @RequestParam("newQuestionNumber") String newQuestionNumber,
                                           @RequestParam("newQuestionBody") String newQuestionBody) {

        // at least either newTeamNumber or newTeamTitle should be set
        boolean updateNumber = !isStringEmpty(newQuestionNumber);
        boolean updateBody = !isStringEmpty(newQuestionBody);

        if (!updateNumber && !updateBody) {
            return new ResponseEntity<>("Neither question number nor question body are set.",
                    HttpStatus.BAD_REQUEST);
        }

        Question question = entityManager.find(Question.class, questionId);
        if (question != null) {
            if (updateNumber) {
                if (isQuestionNumberUnique(newQuestionNumber, question.isOutOfCompetition())) {
                    question.setNumber(newQuestionNumber);
                } else {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
            }

            if (updateBody) {
                question.setBody(newQuestionBody);
            }

            entityManager.persist(question);
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Deletes a question entity found by provided unique question id.
     * @param questionId unique question id.
     * @return HTTP OK if operation succeed, otherwise returns relevant http error code and the error message.
     */
    @RequestMapping(path = "/questions/{questionId}", method = RequestMethod.DELETE, produces = "application/json")
    public ResponseEntity<String> deleteQuestion(@PathVariable long questionId) {
        Query query = entityManager.createQuery("from Answer a where a.questionId=:questionId", Answer.class);
        query.setParameter("questionId", questionId);
        if (query.getResultList().isEmpty()) {
            // question removal is allowed, there are no answers for this question
            Query deletionQuery = entityManager.createQuery("delete from Question q where q.id=:questionId");
            int deletedCount = deletionQuery.setParameter("questionId", questionId).executeUpdate();
            if (deletedCount == 1) {
                return ResponseEntity.ok().build();
            } else {
                return new ResponseEntity<>("Unable to delete question with id: " + questionId,
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            // question removal is not allowed, there are answers for this question in the database
            return new ResponseEntity<>("Question removal is not allowed," +
                                " because the database contains answers for this question.", HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Gets list of all questions.
     * @param isOutOfCompetitionQuestion true if we want to get all questions out of competition, false otherwise.
     * @return list of requested questions.
     */
    private List<Question> getListOfAllQuestions(boolean isOutOfCompetitionQuestion) {
        TypedQuery<Question> query =
                entityManager.createQuery("select question from Question " +
                        "question where question.outOfCompetition=:isOutOfCompetition", Question.class);
        query.setParameter("isOutOfCompetition", isOutOfCompetitionQuestion);
        return query.getResultList();
    }

    /**
     * Checks if question number is unique.
     * @param questionNumber question number to be checked.
     * @param isOutOfCompetition true if we want to check questions out of competition, false otherwise.
     * @return true if question number is unique, false otherwise.
     */
    private boolean isQuestionNumberUnique(String questionNumber, boolean isOutOfCompetition) {
        Query query = entityManager.createQuery("from Question q where q.number=:questionNumber and " +
                "q.outOfCompetition=:isOutOfCompetition", Question.class);
        query.setParameter("questionNumber", questionNumber);
        query.setParameter("isOutOfCompetition", isOutOfCompetition);
        return query.getResultList().isEmpty();
    }
}