package com.github.cdefgah.poetica.controllers;

import com.github.cdefgah.poetica.model.Answer;
import com.github.cdefgah.poetica.model.Team;
import com.github.cdefgah.poetica.model.repositories.TeamsRepository;
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
 * Работа с командами.
 */
@RestController
@Transactional
public class TeamsController extends AbstractController {

    /**
     * Менеджер сущностей для взаимодействия с базой данных.
     */
    @Autowired
    EntityManager entityManager;

    @RequestMapping(path = "/teams/model-constraints", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Map<String, String>> getModelConstraints() {
        return new ResponseEntity<>(Team.getModelConstraintsMap(), HttpStatus.OK);
    }

    @RequestMapping(path = "/teams", method = RequestMethod.POST,
            consumes = "application/x-www-form-urlencoded",
            produces = "application/json")
    public ResponseEntity<String> addNewTeam(@RequestParam("teamNumber") String teamNumber,
                                             @RequestParam("teamTitle") String teamTitle) {

        if (isStringEmpty(teamNumber)) {
            return new ResponseEntity<>(composeErrorMessage("Номер команды не может быть пустым"),
                    HttpStatus.BAD_REQUEST);
        }

        if (isStringEmpty(teamTitle)) {
            return new ResponseEntity<>(composeErrorMessage("Название команды не может быть пустым"),
                    HttpStatus.BAD_REQUEST);
        }

        if (!isNumberUnique(teamNumber)) {
            return new ResponseEntity<>(composeErrorMessage("В базе данных уже существует " +
                            "команда с таким номером: " +
                    teamNumber),
                    HttpStatus.BAD_REQUEST);
        }

        if (!isTitleUnique(teamTitle)) {
            return new ResponseEntity<>(composeErrorMessage("В базе данных уже " +
                            "существует команда с таким названием: " +
                    teamTitle),
                    HttpStatus.BAD_REQUEST);
        }

        Team team = new Team();
        team.setNumber(teamNumber);
        team.setTitle(teamTitle);
        team.setTitleInLowerCase(teamTitle.toLowerCase());
        entityManager.persist(team);
        return new ResponseEntity<>(String.valueOf(team.getId()), HttpStatus.CREATED);
    }


    @RequestMapping(path = "/teams/{teamId}", method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<String> updateTeam(@PathVariable long teamId,
                                             @RequestParam("newTeamNumber") String newTeamNumber,
                                             @RequestParam("newTeamTitle") String newTeamTitle) {

        boolean updateNumber = !isStringEmpty(newTeamNumber);
        boolean updateTitle = !isStringEmpty(newTeamTitle);

        if (!updateNumber && !updateTitle) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).
                    body(composeErrorMessage("Судя по переданным параметрам, ни одно из разрешённых " +
                            "к обновлению свойств команды не обновляется."));
        }

        Team team = entityManager.find(Team.class, teamId);
        if (team == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).
                    body(composeErrorMessage("Не удалось найти команду " +
                            "с указанным идентификатором:  " + teamId));
        }

        if (updateNumber) {
            if (isNumberUnique(newTeamNumber)) {
                team.setNumber(newTeamNumber);
            } else {
                return new ResponseEntity<>(composeErrorMessage("В базе данных уже существует " +
                        "команда с таким номером: " +
                        newTeamNumber),
                        HttpStatus.BAD_REQUEST);
            }
        }

        if (updateTitle) {
            team.setTitle(newTeamTitle);
            team.setTitleInLowerCase(newTeamTitle.toLowerCase());
        }

        entityManager.persist(team);
        return ResponseEntity.ok().build();
    }

    private boolean isNumberUnique(String teamNumber) {
        TypedQuery<Long> query = entityManager.createQuery("select count(*) from Team " +
                "team where team.number=:teamNumber", Long.class);
        query.setParameter("teamNumber", teamNumber);
        return query.getSingleResult() == 0;
    }

    private boolean isTitleUnique(String teamTitle) {
        TypedQuery<Long> query = entityManager.createQuery("select count(*) from Team " +
                "team where team.titleInLowerCase=:titleInLowerCase", Long.class);
        query.setParameter("titleInLowerCase", teamTitle.toLowerCase());
        return query.getSingleResult() == 0;

    }

    @RequestMapping(path = "/teams/all", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<List<Team>> getAllTeams() {
        TypedQuery<Team> query =
                entityManager.createQuery("select team from Team team", Team.class);

        return ResponseEntity.status(HttpStatus.OK).body(query.getResultList());
    }

    @RequestMapping(path = "/teams/{teamId}", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Team> getTeamById(@PathVariable long teamId) {
        Team team = entityManager.find(Team.class, teamId);
        if (team != null) {
            return ResponseEntity.status(HttpStatus.OK).body(team);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @RequestMapping(path = "/teams/numbers/{teamNumber}", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Team> getTeamByNumber(@PathVariable String teamNumber) {
        TypedQuery<Team> query = entityManager.createQuery("select team from Team " +
                "team where team.number=:teamNumber", Team.class);
        query.setParameter("teamNumber", teamNumber);
        final List<Team> foundTeamInfo = query.getResultList();
        if (foundTeamInfo.size() > 0) {
            return ResponseEntity.status(HttpStatus.OK).body(foundTeamInfo.get(0));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @RequestMapping(path = "/answers/import", method = RequestMethod.POST,
            consumes = "application/json",
            produces = "application/json")
    public ResponseEntity<String> validateTeamNumberAndTitle(@RequestBody Team[] teamsToImport) {
        StringBuilder sb = new StringBuilder();
        for (Team team: teamsToImport) {
            if (!isNumberUnique(team.getNumber())) {
                if (sb.length() > 0) {
                    sb.append("\n");
                }

                sb.append("В базе уже есть команда с номером: ").append(team.getNumber());
            }

            if (!isTitleUnique(team.getTitle())) {
                if (sb.length() > 0) {
                    sb.append("\n");
                }

                sb.append("В базе уже есть команда с названием: ").append(team.getNumber());
            }
        }

        // если всё в порядке, вернётся пустая строка
        return ResponseEntity.status(HttpStatus.OK).body(sb.toString());
    }


    @RequestMapping(path = "/teams/{teamId}", method = RequestMethod.DELETE, produces = "application/json")
    public ResponseEntity<String> deleteTeam(@PathVariable long teamId) {
        if (thisTeamHasNoAnswers(teamId)) {
            Query deletionQuery = entityManager.createQuery("delete from Team t where t.id=:teamId");
            final int deletedCount = deletionQuery.setParameter("teamId", teamId).executeUpdate();
            if (deletedCount > 0) {
                return ResponseEntity.noContent().build();
            } else {
                return new ResponseEntity<>(composeErrorMessage("Не удалось " +
                        "удалить команду с идентификатором: " + teamId),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            return new ResponseEntity<>(composeErrorMessage("Нельзя удалить команду, " +
                    "так как в базе сохранены полученные от неё ответы"),
                    HttpStatus.BAD_REQUEST);
        }
    }

    @RequestMapping(path = "/teams/total-number", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Long> getTotalNumberOfTeams() {
        TypedQuery<Long> query =
                entityManager.createQuery("select count(*) FROM Team team", Long.class);

        return new ResponseEntity<>(query.getSingleResult(), HttpStatus.OK);
    }

    private boolean thisTeamHasNoAnswers(long teamId) {
        Query query = entityManager.createQuery("from Answer a where a.teamId=:teamId", Answer.class);
        query.setParameter("teamId", teamId);
        return query.getResultList().isEmpty();
    }
}