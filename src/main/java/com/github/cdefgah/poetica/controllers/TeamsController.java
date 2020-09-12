/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.controllers;

import com.github.cdefgah.poetica.model.Answer;
import com.github.cdefgah.poetica.model.Grade;
import com.github.cdefgah.poetica.model.Team;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.persistence.Query;
import javax.persistence.TypedQuery;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;


/**
 * Работа с командами.
 */
@RestController
@Transactional
public class TeamsController extends AbstractController {

    private static final long NO_TEAM_ID = 0;

    @RequestMapping(path = "/teams/model-constraints", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Map<String, String>> getModelConstraints() {
        return new ResponseEntity<>(Team.getModelConstraintsMap(), HttpStatus.OK);
    }

    @RequestMapping(path = "/teams", method = RequestMethod.POST,
            consumes = "application/x-www-form-urlencoded",
            produces = "application/json")
    public ResponseEntity<String> addNewTeam(@RequestParam("teamNumber") int teamNumber,
                                             @RequestParam("teamTitle") String teamTitle) {

        if (teamNumber < 0) {
            return new ResponseEntity<>(composeErrorMessage("Номер команды не может быть отрицательным"),
                    HttpStatus.BAD_REQUEST);
        }

        if (isStringEmpty(teamTitle)) {
            return new ResponseEntity<>(composeErrorMessage("Название команды не может быть пустым"),
                    HttpStatus.BAD_REQUEST);
        }

        if (!isNumberUnique(teamNumber, NO_TEAM_ID)) {
            return new ResponseEntity<>(composeErrorMessage("В базе данных уже существует " +
                            "команда с таким номером: " +
                    teamNumber),
                    HttpStatus.BAD_REQUEST);
        }

        if (!isTitleUnique(teamTitle, NO_TEAM_ID)) {
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
                                             @RequestParam("newTeamNumber") int newTeamNumber,
                                             @RequestParam("newTeamTitle") String newTeamTitle) {

        boolean updateNumber = newTeamNumber >= 0;
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
            if (isNumberUnique(newTeamNumber, teamId)) {
                team.setNumber(newTeamNumber);
            } else {
                return new ResponseEntity<>(composeErrorMessage("В базе данных уже существует " +
                        "команда с таким номером: " +
                        newTeamNumber),
                        HttpStatus.BAD_REQUEST);
            }
        }

        if (updateTitle) {
            if (isTitleUnique(newTeamTitle, teamId)) {
                team.setTitle(newTeamTitle);
                team.setTitleInLowerCase(newTeamTitle.toLowerCase());
            }
        }

        entityManager.persist(team);
        return ResponseEntity.ok().build();
    }

    private boolean isNumberUnique(int teamNumber, long processingTeamId) {
        TypedQuery<Long> query = entityManager.createQuery("select count(*) from Team " +
                "team where team.number=:teamNumber and team.id<>:processingTeamId", Long.class);

        query.setParameter("teamNumber", teamNumber);
        query.setParameter("processingTeamId", processingTeamId);
        return query.getSingleResult() == 0;
    }

    private boolean isTitleUnique(String teamTitle, long processingTeamId) {
        TypedQuery<Long> query = entityManager.createQuery("select count(*) from Team " +
                "team where team.titleInLowerCase=:titleInLowerCase and team.id<>:processingTeamId", Long.class);

        query.setParameter("titleInLowerCase", teamTitle.toLowerCase());
        query.setParameter("processingTeamId", processingTeamId);
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
    public ResponseEntity<Team> getTeamByNumber(@PathVariable int teamNumber) {
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

    @RequestMapping(path = "/teams/validate", method = RequestMethod.POST,
            consumes = "application/json",
            produces = "application/json")
    public ResponseEntity<List<String>> validateTeamNumberAndTitle(@RequestBody Team[] teamsToImport) {
        List<String> validationErrors = new ArrayList<>();
        for (Team team: teamsToImport) {
            if (!isNumberUnique(team.getNumber(), team.getId())) {
                validationErrors.add("В базе уже есть команда с номером: " + team.getNumber());
            }

            if (!isTitleUnique(team.getTitle(), team.getId())) {
                validationErrors.add("В базе уже есть команда с названием: " + team.getTitle());
            }
        }

        // если всё в порядке, вернётся пустая строка
        return ResponseEntity.status(HttpStatus.OK).body(validationErrors);
    }

    @RequestMapping(path = "/teams/import", method = RequestMethod.POST,
            consumes = "application/json",
            produces = "application/json")
    public ResponseEntity<String> importTeams(@RequestBody Team[] teamsToImport) {
       for (Team team: teamsToImport) {
           team.setTitleInLowerCase(team.getTitle().toLowerCase());
           entityManager.persist(team);
       }

       return ResponseEntity.status(HttpStatus.OK).body("");
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

    @RequestMapping(path = "/teams/export", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Resource> exportTeams() {
        TypedQuery<Team> query = entityManager.createQuery("select team from Team team", Team.class);
        List<Team> allTeams = query.getResultList();

        StringBuilder payload = new StringBuilder();
        for (Team team : allTeams) {
            payload.append(team.getTextRepresentationForImporter());
        }

        String fileName = "exportedTeams_" + this.getTimeStampPartForFileName()  +".txt";
        HttpHeaders header = this.getHttpHeaderForGeneratedFile(fileName);

        ByteArrayResource resource = new ByteArrayResource(payload.toString().getBytes(StandardCharsets.UTF_8));

        return ResponseEntity.ok()
                .headers(header)
                .contentLength(resource.contentLength())
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(resource);
    }

    private boolean thisTeamHasNoAnswers(long teamId) {
        Query query = entityManager.createQuery("from Answer a where a.teamId=:teamId", Answer.class);
        query.setParameter("teamId", teamId);
        return query.getResultList().isEmpty();
    }

    @RequestMapping(path = "/teams/only-with-not-graded-answers", method = RequestMethod.GET)
    public ResponseEntity<List<Team>> getOnlyTeamsWithNotGradedAnswers() {
        TypedQuery<Team> query = entityManager.createQuery("select distinct team from Team team, " +
                "Answer answer where team.id=answer.teamId and answer.grade=:grade", Team.class);
        query.setParameter("grade", Grade.None);

        return ResponseEntity.status(HttpStatus.OK).body(query.getResultList());
    }
}