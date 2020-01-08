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

@RestController
@Transactional
public class AnswersController extends AbstractController {

    @Autowired
    EntityManager entityManager;

    @RequestMapping(path = "/answers", method = RequestMethod.POST, consumes = "application/x-www-form-urlencoded",
            produces = "application/json")
    public ResponseEntity<Answer> addNewAnswer(@RequestParam("questionId") Long questionId,
                                               @RequestParam("teamId") Long teamId,
                                               @RequestParam("answerBody") String answerBody,
                                               @RequestParam("comment") String comment,
                                               @RequestParam("gradeSymbol") String gradeSymbol) {

        // TODO - get existing answer for the questionId and teamId
        // and if it exists - update it, don't create new one

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
        }

        Answer answer = new Answer();
        answer.setQuestionId(questionId);
        answer.setTeamId();

        answer.setBody(answerBody);


        entityManager.persist(question);
        return new ResponseEntity<>(question, HttpStatus.CREATED);
    }

}
