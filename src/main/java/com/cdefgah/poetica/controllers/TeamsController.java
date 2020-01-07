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
    public ResponseEntity<Long> addNewTeam(@RequestParam("teamNumber") String teamNumber,
                                             @RequestParam("teamTitle") String teamTitle) {
        Team team = new Team();
        team.setTeamTitle(teamTitle);
        team.setTeamNumber(teamNumber);
        entityManager.persist(team);
        return new ResponseEntity<>(team.getId(), HttpStatus.CREATED);
    }

    @RequestMapping(path = "/teams/all", method = RequestMethod.GET, produces = "application/json")
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

    @RequestMapping(path = "/teams", method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<Team> updateTeamTitle(@RequestParam("teamId") long teamId,
                                                @RequestParam("newTeamTitle") String newTeamTitle) {

        if (newTeamTitle == null || newTeamTitle.trim().length() == 0) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        Team team = entityManager.find(Team.class, teamId);
        if (team != null) {
            team.setTeamTitle(newTeamTitle);
            entityManager.persist(team);
            return new ResponseEntity<>(team, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     *     @RequestMapping(path = "/teams", method = RequestMethod.PUT, produces = "application/json")
     *     public ResponseEntity<Team> updateTeamNumber(@RequestParam("teamId") long teamId,
     *                                                 @RequestParam("newTeamNumber") String newTeamNumber) {
     *
     *         if (newTeamNumber == null || newTeamNumber.trim().length() == 0) {
     *             return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
     *         }
     *
     *         Team team = entityManager.find(Team.class, teamId);
     *         if (team != null) {
     *             team.setTeamNumber(newTeamNumber);
     *             entityManager.persist(team);
     *             return new ResponseEntity<>(team, HttpStatus.OK);
     *         } else {
     *             return new ResponseEntity<>(HttpStatus.NOT_FOUND);
     *         }
     *     }
     */
}