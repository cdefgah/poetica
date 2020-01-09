package com.cdefgah.poetica.controllers;

import com.cdefgah.poetica.model.Answer;
import com.cdefgah.poetica.model.Grade;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import java.util.List;
import java.util.Optional;

@RestController
@Transactional
public class AnswersController extends AbstractController {

    /**
     * Entity manager that works with the underlying database.
     */
    @Autowired
    EntityManager entityManager;

    /**
     * Adds a new answer entity to the database.
     * @param questionId unique id of the answered question.
     * @param teamId unique if o a team that has given the answer.
     * @param answerBody body of the provided answer.
     * @param comment comment from the team that answered the question.
     * @param gradeSymbol grade put on the answer by the duty team.
     * @return HTTP OK and the unique id of created answer entity, or returns relevant http error codes with
     * error messages.
     */
    @RequestMapping(path = "/answers", method = RequestMethod.POST, consumes = "application/x-www-form-urlencoded",
            produces = "application/json")
    public ResponseEntity<String> addNewAnswer(@RequestParam("questionId") Long questionId,
                                               @RequestParam("teamId") Long teamId,
                                               @RequestParam("answerBody") String answerBody,
                                               @RequestParam("comment") String comment,
                                               @RequestParam("gradeSymbol") String gradeSymbol) {

        if (isStringEmpty(answerBody)) {
            return new ResponseEntity<>("The answer body is not provided", HttpStatus.BAD_REQUEST);
        }

        Grade grade = Grade.None;
        if (!isStringEmpty(gradeSymbol)) {
            Optional<Grade> gradeConversionResult = Grade.fromGradeSymbol(gradeSymbol);
            if (gradeConversionResult.isPresent()) {
                grade = gradeConversionResult.get();
            } else {
                return new ResponseEntity<>("Unexpected grade symbol: " + gradeSymbol, HttpStatus.BAD_REQUEST);
            }
        }

        // checking for existing answer for the same question from the same team
        TypedQuery<Answer> query = entityManager.createQuery("from Answer a where a.questionId=:questionId " +
                                                                                "and a.teamId=:teamId", Answer.class);

        query.setParameter("questionId", questionId);
        query.setParameter("teamId", teamId);
        List<Answer> foundAnswersList = query.getResultList();
        Answer answer;
        if (!foundAnswersList.isEmpty()) {
            answer = foundAnswersList.get(0); // getting the only single result
            answer.setGrade(Grade.None); // resetting grade
            answer.setComment(""); // resetting comment
        } else {
            answer = new Answer();
        }

        answer.setQuestionId(questionId);
        answer.setTeamId(teamId);
        answer.setBody(answerBody);
        answer.setComment(comment);
        answer.setGrade(grade);

        entityManager.persist(answer);
        return new ResponseEntity<>(String.valueOf(answer.getId()), HttpStatus.CREATED);
    }

    /**
     * Gets all answers for the specified question.
     * @param questionId question id.
     * @return list of found answers.
     */
    @RequestMapping(path = "/answers/{questionId}", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<List<Answer>> getAnswersByQuestionId(@PathVariable long questionId) {
        TypedQuery<Answer> query =
                entityManager.createQuery("select answer from Answer answer" +
                                                                        " where answer.teamId=:teamId", Answer.class);

        query.setParameter("questionId", questionId);
        return new ResponseEntity<>(query.getResultList(), HttpStatus.OK);
    }

    /**
     * Deletes an answer found by provided unique answer id.
     * @param answerId unique answer id.
     * @return HTTP OK if operation succeed, otherwise returns relevant http error code and the error message.
     */
    @RequestMapping(path = "/answers/{answerId}", method = RequestMethod.DELETE, produces = "application/json")
    public ResponseEntity<String> deleteAnswer(@PathVariable long answerId) {
        Query deletionQuery = entityManager.createQuery("delete from Answer answer where answer.id=:answerId");
        int deletedCount = deletionQuery.setParameter("answerId", answerId).executeUpdate();
        if (deletedCount == 1) {
            return ResponseEntity.ok().build();
        } else {
            return new ResponseEntity<>("Unable to delete answer with id: " + answerId,
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}