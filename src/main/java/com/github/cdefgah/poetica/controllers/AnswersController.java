package com.github.cdefgah.poetica.controllers;

import com.github.cdefgah.poetica.model.Answer;
import com.github.cdefgah.poetica.model.Question;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.TypedQuery;
import java.util.Map;
import java.util.Optional;

@RestController
@Transactional
public class AnswersController extends AbstractController {

    /**
     * Менеджер сущностей для взаимодействия с базой данных.
     */
    @Autowired
    EntityManager entityManager;

    @RequestMapping(path = "/answers/model-constraints", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Map<String, String>> getModelConstraints() {
        return new ResponseEntity<>(Answer.getModelConstraintsMap(), HttpStatus.OK);
    }


    @RequestMapping(path = "/answers/import", method = RequestMethod.POST,
            consumes = "application/json",
            produces = "application/json")
    public ResponseEntity<String> importAnswers(@RequestBody Answer[] answersToImport) {

        for(Answer oneAnswer: answersToImport) {
            Optional<Long> questionIdInfo = getQuestionIdByQuestionNumber(oneAnswer.getQuestionNumber());
            if (questionIdInfo.isPresent()) {
                oneAnswer.setQuestionId(questionIdInfo.get());
                entityManager.persist(oneAnswer);
            } else {
                return new ResponseEntity<>("В базе данных не удалось найти вопрос с номером: " +
                                                            oneAnswer.getQuestionNumber(), HttpStatus.BAD_REQUEST);
            }
        }

        return new ResponseEntity<>("", HttpStatus.OK);
    }

    private Optional<Long> getQuestionIdByQuestionNumber(int questionNumber) {
        TypedQuery<Long> query =
                entityManager.createQuery("select id FROM Question question WHERE " +
                        "question.number=:requestedQuestionNumber", Long.class);

        query.setParameter("requestedQuestionNumber", questionNumber);

        try {
            return Optional.of(query.getSingleResult());

        } catch(NoResultException noResultException) {
            // сюда управление в принципе своём не может быть передано, но мы обрабатываем всё равно
            return Optional.empty();
        }
    }
}