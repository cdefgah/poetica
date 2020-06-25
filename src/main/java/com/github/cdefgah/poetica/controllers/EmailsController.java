package com.github.cdefgah.poetica.controllers;

import com.github.cdefgah.poetica.model.Answer;
import com.github.cdefgah.poetica.model.Email;
import com.github.cdefgah.poetica.model.Question;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.util.List;
import java.util.Map;

@RestController
@Transactional
public class EmailsController extends AbstractController {

    /**
     * Менеджер сущностей для взаимодействия с базой данных.
     */
    @Autowired
    EntityManager entityManager;

    @RequestMapping(path = "/emails/model-constraints", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Map<String, String>> getModelConstraints() {
        return new ResponseEntity<>(Email.getModelConstraintsMap(), HttpStatus.OK);
    }

    @RequestMapping(path = "/emails/import", method = RequestMethod.POST,
            consumes = "application/json",
            produces = "application/json")
    public ResponseEntity<String> importAnswers(@RequestBody Email email2Import) {
        entityManager.persist(email2Import);
        return new ResponseEntity<>(String.valueOf(email2Import.getId()), HttpStatus.OK);
    }


    /**
     * Отдаёт электронные письма от конкретной команды по всем либо по указанному раунду.
     * @param teamId идентификатор команды.
     * @param roundOption номер раунда, если нужно по всем, передаём 0.
     * @return список электронных писем.
     */
    @RequestMapping(path = "/emails/{teamId}/{roundOption}", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<List<Email>> getEmails(@PathVariable long teamId, @PathVariable int roundOption) {
        TypedQuery<Email> query;

        if (roundOption == 0) {
            // нужны все письма
            query = entityManager.createQuery("select email from Email email where email.teamId=:teamId",
                                                                                                           Email.class);
            query.setParameter("teamId", teamId);

        } else {
            // нужны письма с ответами на определенный тур (раунд)
            query = entityManager.createQuery("select email from Email email where email.teamId=:teamId and email.roundNumber=:roundNumber",
                    Email.class);
            query.setParameter("teamId", teamId);
            query.setParameter("roundNumber", roundOption);
        }

        return ResponseEntity.status(HttpStatus.OK).body(query.getResultList());
    }
}