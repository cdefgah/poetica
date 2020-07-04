package com.github.cdefgah.poetica.controllers;

import com.github.cdefgah.poetica.model.Email;
import com.github.cdefgah.poetica.model.EmailsCountDigest;
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

    @RequestMapping(path = "/emails/digest/{teamId}", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<EmailsCountDigest> getEmailsDigestForTeam(@PathVariable long teamId) {
        TypedQuery<Long> totalEmailsQuery =
                entityManager.createQuery("select count(*) FROM Email email where email.teamId=:teamId",
                        Long.class);

        totalEmailsQuery.setParameter("teamId", teamId);
        long totalEmailsCount = totalEmailsQuery.getSingleResult();

        TypedQuery<Long> firstRoundEmailsQuery =
                entityManager.createQuery("select count(*) FROM Email email " +
                                "where email.teamId=:teamId and email.roundNumber=:roundNumber",
                                                                                Long.class);

        firstRoundEmailsQuery.setParameter("teamId", teamId);
        firstRoundEmailsQuery.setParameter("roundNumber", 1);

        long firstRoundEmailsCount = firstRoundEmailsQuery.getSingleResult();
        long secondRoundEmailsCount = totalEmailsCount - firstRoundEmailsCount;

        EmailsCountDigest emailsCountDigest = new EmailsCountDigest(firstRoundEmailsCount, secondRoundEmailsCount);

        return new ResponseEntity<>(emailsCountDigest, HttpStatus.OK);
    }

    @RequestMapping(path = "/emails/is-unique/{teamId}/{roundNumber}/{emailSentOn}",
                                                            method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<String> checkEmailUniqueness(@PathVariable long teamId,
                                                       @PathVariable int roundNumber,
                                                       @PathVariable long emailSentOn) {

        TypedQuery<Email> query = entityManager.createQuery("select email from Email email " +
                        "where email.teamId=:teamId and email.roundNumber=:roundNumber and email.sentOn=:emailSentOn",
                        Email.class);

        query.setParameter("teamId", teamId);
        query.setParameter("roundNumber", roundNumber);
        query.setParameter("emailSentOn", emailSentOn);

        boolean isEmailUnique = query.getResultList().size() == 0;
        final String emailIsUniqueFlag = "1";
        final String emailIsNotUniqueFlag = "-1";

        final String flagToReturn = isEmailUnique ? emailIsUniqueFlag : emailIsNotUniqueFlag;
        return new ResponseEntity<>(flagToReturn, HttpStatus.OK);
    }

    @RequestMapping(path = "/emails/{emailId}", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Email> getEmailById(@PathVariable long emailId) {
        Email email = entityManager.find(Email.class, emailId);
        if (email != null) {
            return ResponseEntity.status(HttpStatus.OK).body(email);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @RequestMapping(path = "/emails/delete/{emailId}", method = RequestMethod.DELETE, produces = "application/json")
    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<String> deleteEmailAndAnswers(@PathVariable  long emailId) {

        Query answersDeletionQuery = entityManager.createQuery("delete from Answer answer " +
                                                                                       "where answer.emailId=:emailId");
        answersDeletionQuery.setParameter("emailId", emailId).executeUpdate();

        Query emailDeletionQuery = entityManager.createQuery("delete from Email email where email.id=:emailId");
        final int deletedEmailsCount = emailDeletionQuery.setParameter("emailId", emailId).executeUpdate();
        if (deletedEmailsCount > 0) {
            return ResponseEntity.noContent().build();
        } else {
            return new ResponseEntity<>(composeErrorMessage("Не удалось удалить письмо с идентификатором: "
                        + emailId),
                        HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}