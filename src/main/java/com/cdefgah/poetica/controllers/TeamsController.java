package com.cdefgah.poetica.controllers;

import com.cdefgah.poetica.model.Team;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
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
public class TeamsController {

    @Autowired
    ApplicationContext context;

    @Autowired
    EntityManager entityManager;

    @RequestMapping(path = "/teams", method = RequestMethod.POST, consumes = "application/x-www-form-urlencoded",
            produces = "application/json")
    public ResponseEntity<String> addNewTeam(@RequestParam("teamNumber") String teamNumber,
                                             @RequestParam("teamTitle") String teamTitle) {

        Team team = new Team();
        team.setTeamTitle("Boshtulke: " + teamTitle);
        team.setTeamNumber("KOKOKO123: " + teamNumber);
        entityManager.persist(team);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @RequestMapping(path = "/teams", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Team> getTeamByNumber(@RequestParam("teamNumber") String teamNumber) {
        return null;
    }
}