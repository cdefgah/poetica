package com.cdefgah.poetica.controllers;

import com.cdefgah.poetica.model.Answer;
import com.cdefgah.poetica.model.Grade;
import com.cdefgah.poetica.model.Question;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.List;

@RestController
@Transactional
public class AnswersController extends AbstractController {

    /**
     * Entity manager that works with the underlying database.
     */
    @Autowired
    EntityManager entityManager;

    @RequestMapping(path = "/answers", method = RequestMethod.POST, consumes = "application/x-www-form-urlencoded",
            produces = "application/json")
    public ResponseEntity<Answer> addNewAnswer(@RequestParam("questionId") Long questionId,
                                               @RequestParam("teamId") Long teamId,
                                               @RequestParam("answerBody") String answerBody,
                                               @RequestParam("comment") String comment,
                                               @RequestParam("gradeSymbol") String gradeSymbol) {

        if (isStringEmpty(answerBody) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        Grade grade;
        if (!isStringEmpty(gradeSymbol)) {
            try {
                grade = Grade.fromGradeSymbol(gradeSymbol);
            } catch(IllegalArgumentException iaex) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        } else {
            // you should explicitly pass Grade.None if there's no grade set.
            // No implicit empty string values, as they produce hard-to-catch bugs.
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        Query query = entityManager.createQuery("from Answer a where a.questionId=:questionId " +
                                                                                "and a.teamId=:teamId", Answer.class);

        query.setParameter("questionId", questionId);
        query.setParameter("teamId", teamId);

        List<Answer> foundAnswersList = query.getResultList();
        Answer answer;
        if (!foundAnswersList.isEmpty()) {
            answer = foundAnswersList.get(0); // getting the only single result
            answer.setGrade(Grade.None); // resetting grade
            answer.setComment("");
        } else {
            answer = new Answer();
        }

        Answer answer = new Answer();
        answer.setQuestionId(questionId);
        answer.setTeamId();

        answer.setBody(answerBody);


        entityManager.persist(question);
        return new ResponseEntity<>(question, HttpStatus.CREATED);
    }

}
