package com.github.cdefgah.poetica.model.repositories;

import com.github.cdefgah.poetica.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface TeamsRepository extends JpaRepository<Team, Long> {

}