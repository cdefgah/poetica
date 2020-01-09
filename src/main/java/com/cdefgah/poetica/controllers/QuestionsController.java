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
import java.util.List;

@RestController
@Transactional
public class QuestionsController extends AbstractController {

    /**
     * Entity manager that works with the underlying database.
     */
    @Autowired
    EntityManager entityManager;

    @RequestMapping(path = "/questions", method = RequestMethod.POST, consumes = "application/x-www-form-urlencoded",
            produces = "application/json")
    public ResponseEntity<Question> addNewQuestion(@RequestParam("questionNumber") String questionNumber,
                                               @RequestParam("questionBody") String questionBody,
                                               @RequestParam("isOutOfCompetition") boolean isOutOfCompetition) {

        if (isStringEmpty(questionNumber) ||
                        !isQuestionNumberUnique(questionNumber, isOutOfCompetition) || isStringEmpty(questionBody)) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        Question question = new Question();
        question.setNumber(questionNumber);
        question.setBody(questionBody);
        question.setOutOfCompetition(isOutOfCompetition);
        entityManager.persist(question);
        return new ResponseEntity<>(question, HttpStatus.CREATED);
    }

    @RequestMapping(path = "/questions", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<List<Question>> getAllQuestions() {
        Query query = entityManager.createQuery("select question from Question question", Question.class);
        return new ResponseEntity(query.getResultList(), HttpStatus.OK);
    }

    @RequestMapping(path = "/questions/{questionId}", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Question> getQuestionById(@PathVariable long questionId) {
        Question question = entityManager.find(Question.class, questionId);
        if (question != null) {
            return new ResponseEntity<>(question, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }


    @RequestMapping(path = "/questions/{questionId}", method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<Question> updateQuestion(@PathVariable long questionId,
                                           @RequestParam("newQuestionNumber") String newQuestionNumber,
                                           @RequestParam("newQuestionBody") String newQuestionBody) {

        // at least either newTeamNumber or newTeamTitle should be set
        boolean updateNumber = !isStringEmpty(newQuestionNumber);
        boolean updateBody = !isStringEmpty(newQuestionBody);

        if (!updateNumber && !updateBody) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
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
            return new ResponseEntity<>(question, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @RequestMapping(path = "/questions/{questionId}", method = RequestMethod.DELETE, produces = "application/json")
    public ResponseEntity<String> deleteQuestion(@PathVariable long questionId) {
        Query query = entityManager.createQuery("from Answer a where a.questionId=:questionId", Answer.class);
        query.setParameter("questionId", questionId);
        if (query.getResultList().isEmpty()) {
            // team removal is allowed, there are no answers for this question
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

    private boolean isQuestionNumberUnique(String questionNumber, boolean isOutOfCompetition) {
        Query query = entityManager.createQuery("from Question q where q.number=:questionNumber and " +
                "q.outOfCompetition=:isOutOfCompetition", Question.class);
        query.setParameter("questionNumber", questionNumber);
        query.setParameter("isOutOfCompetition", isOutOfCompetition);
        return query.getResultList().isEmpty();
    }
}