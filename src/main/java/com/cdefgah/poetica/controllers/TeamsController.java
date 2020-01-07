package com.cdefgah.poetica.controllers;

import com.cdefgah.poetica.model.Team;
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
public class TeamsController {

    @Autowired
    EntityManager entityManager;

    @RequestMapping(path = "/teams", method = RequestMethod.POST, consumes = "application/x-www-form-urlencoded",
            produces = "application/json")
    public ResponseEntity<Team> addNewTeam(@RequestParam("teamNumber") String teamNumber,
                                             @RequestParam("teamTitle") String teamTitle) {
        if (!isTeamNumberUnique(teamNumber)) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        Team team = new Team();
        team.setTitle(teamTitle);
        team.setNumber(teamNumber);
        entityManager.persist(team);
        return new ResponseEntity<>(team, HttpStatus.CREATED);
    }

    @RequestMapping(path = "/teams", method = RequestMethod.GET, produces = "application/json")
    public List<Team> getAllTeams() {
        Query query = entityManager.createQuery("select team from Team team", Team.class);
        return query.getResultList();
    }

    @RequestMapping(path = "/teams/{teamId}", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Team> getTeamById(@PathVariable long teamId) {
        Team team = entityManager.find(Team.class, teamId);
        if (team != null) {
            return new ResponseEntity<>(team, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @RequestMapping(path = "/teams/{teamId}", method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<Team> updateTeam(@PathVariable long teamId,
                                           @RequestParam("newTeamNumber") String newTeamNumber,
                                           @RequestParam("newTeamTitle") String newTeamTitle) {

        // at least either newTeamNumber or newTeamTitle should be set
        boolean updateNumber = !(newTeamNumber == null || newTeamNumber.isEmpty());
        boolean updateTitle = !(newTeamTitle == null || newTeamTitle.isEmpty());

        if (!updateNumber && !updateTitle) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        Team team = entityManager.find(Team.class, teamId);
        if (team != null) {
            if (updateNumber) {
                if (isTeamNumberUnique(newTeamNumber)) {
                    team.setNumber(newTeamNumber);
                } else {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
            }

            if (updateTitle) {
                team.setTitle(newTeamTitle);
            }

            entityManager.persist(team);
            return new ResponseEntity<>(team, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @RequestMapping(path = "/teams/{teamId}", method = RequestMethod.DELETE, produces = "application/json")
    public ResponseEntity<Team> deleteTeam(@PathVariable long teamId) {
        // TODO check existing answers, if there are existing answers don't delete
        return new ResponseEntity(HttpStatus.NOT_IMPLEMENTED);
    }

    private boolean isTeamNumberUnique(String teamNumber) {
        Query query = entityManager.createQuery("from Team t where t.number=:teamNumber", Team.class);
        query.setParameter("teamNumber", teamNumber);
        return query.getResultList().isEmpty();
    }
}