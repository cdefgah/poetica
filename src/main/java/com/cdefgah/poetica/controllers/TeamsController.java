package com.cdefgah.poetica.controllers;

import com.cdefgah.poetica.model.Answer;
import com.cdefgah.poetica.model.Team;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import java.util.List;
import java.util.Optional;


/**
 * Handles team-related requests.
 */
@RestController
@Transactional
public class TeamsController extends AbstractController {

    /**
     * Entity manager that works with the underlying database.
     */
    @Autowired
    EntityManager entityManager;

    /**
     * Creates new team entity in the database.
     *
     * @param teamNumber A unique number assigned to the team. Could be empty string and will be set later.
     * @param teamTitle  Unique team title.
     * @return Http.OK and Unique id (don't confuse it with the team number) of the created team entity.
     * In case of error returns Http.BAD_REQUEST with the error message.
     */
    @RequestMapping(path = "/teams", method = RequestMethod.POST, consumes = "application/x-www-form-urlencoded",
            produces = "application/json")
    public ResponseEntity<String> addNewTeam(@RequestParam("teamNumber") String teamNumber,
                                             @RequestParam("teamTitle") String teamTitle) {

        if (!isStringEmpty(teamNumber) && !isTeamNumberUnique(teamNumber)) {
            return new ResponseEntity<>("teamNumber is not unique: " + teamNumber, HttpStatus.BAD_REQUEST);
        }

        if (isStringEmpty(teamTitle)) {
            return new ResponseEntity<>("teamTitle is not provided", HttpStatus.BAD_REQUEST);
        }

        if (getTeamByTitle(teamTitle).isPresent()) {
            return new ResponseEntity<>("teamTitle is not unique. " +
                    "There's a team exists with the same title: " + teamTitle, HttpStatus.BAD_REQUEST);
        }

        Team team = new Team();
        team.setTitle(teamTitle);
        team.setNumber(teamNumber);
        entityManager.persist(team);
        return new ResponseEntity<>(String.valueOf(team.getId()), HttpStatus.CREATED);
    }

    /**
     * Gets the list of all teams.
     *
     * @return Http.OK and the list of teams in json format.
     */
    @RequestMapping(path = "/teams", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<List<Team>> getAllTeams() {
        TypedQuery<Team> query = entityManager.createQuery("select team from Team team", Team.class);
        return new ResponseEntity<>(query.getResultList(), HttpStatus.OK);
    }

    /**
     * Gets team entity by its unique id.
     *
     * @param teamId unique team id.
     * @return Http.OK and the team entity in json format. In case team was not found, returns Http.NOT_FOUND.
     */
    @RequestMapping(path = "/teams/{teamId}", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Team> getTeamById(@PathVariable long teamId) {
        Team team = entityManager.find(Team.class, teamId);
        if (team != null) {
            return new ResponseEntity<>(team, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @RequestMapping(path = "/teams/{teamTitle}", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<Team> getTeamById(@PathVariable String teamTitle) {
        if (isStringEmpty(teamTitle)) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        Optional<Team> teamOptional = getTeamByTitle(teamTitle);
        return teamOptional.map(team -> new ResponseEntity<>(team, HttpStatus.OK)).orElseGet(() ->
                new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Updates a team entity with the provided information.
     *
     * @param teamId        unique id of a team to be updated.
     * @param newTeamNumber new team number.
     * @param newTeamTitle  new team title.
     * @return Http.OK if update was successful. Otherwise will return relevant http error code
     * and the error message.
     */
    @RequestMapping(path = "/teams/{teamId}", method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<String> updateTeam(@PathVariable long teamId,
                                             @RequestParam("newTeamNumber") String newTeamNumber,
                                             @RequestParam("newTeamTitle") String newTeamTitle) {

        // at least either newTeamNumber or newTeamTitle should be set
        boolean updateNumber = !isStringEmpty(newTeamNumber);
        boolean updateTitle = !isStringEmpty(newTeamTitle);

        if (!updateNumber && !updateTitle) {
            return new ResponseEntity<>("Neither newTeamNumber nor newTeamTitle are set.",
                    HttpStatus.BAD_REQUEST);
        }

        Team team = entityManager.find(Team.class, teamId);
        if (team != null) {
            if (updateNumber) {
                if (isTeamNumberUnique(newTeamNumber)) {
                    team.setNumber(newTeamNumber);
                } else {
                    return new ResponseEntity<>("Provided new team number is not unique: " + newTeamNumber,
                            HttpStatus.BAD_REQUEST);
                }
            }

            if (updateTitle) {
                team.setTitle(newTeamTitle);
            }

            entityManager.persist(team);
            return ResponseEntity.ok().build();
        } else {
            return new ResponseEntity<>("The team with provided id is not found: " + teamId,
                    HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Removes the team from the database. Usually it is not allowed/permitted operation, because all teams should
     * be stored in the database, even those, who stopped participating in the game. Because of that I don't implement
     * cascading removal of the all related information. It may be used to remove a team added by mistake, or something
     * like this.
     *
     * @param teamId id of team that should be removed.
     * @return return Http.OK if operation succeed. Otherwise returns relevant http error code with the error message.
     */
    @RequestMapping(path = "/teams/{teamId}", method = RequestMethod.DELETE, produces = "application/json")
    public ResponseEntity<String> deleteTeam(@PathVariable long teamId) {
        Query query = entityManager.createQuery("from Answer a where a.teamId=:teamId", Answer.class);
        query.setParameter("teamId", teamId);
        if (query.getResultList().isEmpty()) {
            // team removal is allowed, there are no answers from this team
            Query deletionQuery = entityManager.createQuery("delete from Team t where t.id=:teamId");
            int deletedCount = deletionQuery.setParameter("teamId", teamId).executeUpdate();
            if (deletedCount == 1) {
                return ResponseEntity.ok().build();
            } else {
                return new ResponseEntity<>("Unable to delete team with id: " + teamId,
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            // team removal is not allowed, there are answers from this team exist in the database
            return new ResponseEntity<>("Team removal is not allowed," +
                    " because the database contains answers, created by this team.", HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Checks whether teamNumber is unique (i.e not present in the database).
     *
     * @param teamNumber teamNumber to be checked.
     * @return true, if there's no such teamNumber stored in the database, false otherwise.
     */
    private boolean isTeamNumberUnique(String teamNumber) {
        Query query = entityManager.createQuery("from Team t where t.number=:teamNumber", Team.class);
        query.setParameter("teamNumber", teamNumber);
        return query.getResultList().isEmpty();
    }

    /**
     * Gets team entity by its unique teamTitle.
     *
     * @param teamTitle team title to be used.
     * @return team entity weapped by Optional type object if found, otherwise returns Optional.empty().
     */
    private Optional<Team> getTeamByTitle(String teamTitle) {
        TypedQuery<Team> query = entityManager.createQuery("from Team t where t.title=:teamTitle", Team.class);
        query.setParameter("teamTitle", teamTitle);
        List<Team> queryResult = query.getResultList();
        if (!queryResult.isEmpty()) {
            return Optional.of(queryResult.get(0));
        } else {
            return Optional.empty();
        }
    }
}