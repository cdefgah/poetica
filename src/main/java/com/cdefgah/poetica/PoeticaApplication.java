package com.cdefgah.poetica;

import com.cdefgah.poetica.model.Team;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class PoeticaApplication {

	public static void main(String[] args) {
		SpringApplication.run(PoeticaApplication.class, args);

//		ApplicationContext context = SpringApplication.run(PoeticaApplication.class, args);
//		TeamsRepository repo = context.getBean(TeamsRepository.class);

//		Team team = new Team();
//		team.setTeamNumber("ZIZIZI90999");
//		team.setTeamTitle("STARTupppppo!");

//		repo.save(team);
	}
}
