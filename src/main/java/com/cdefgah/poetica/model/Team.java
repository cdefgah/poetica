package com.cdefgah.poetica.model;

import javax.persistence.*;

@Entity
@Table(name = "Teams")
public final class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "team_number", length = 32, nullable = false, unique = true)
    private String teamNumber;

    @Column(name = "team_title", length = 256, nullable = false)
    private String teamTitle;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTeamNumber() {
        return teamNumber;
    }

    public void setTeamNumber(String teamNumber) {
        this.teamNumber = teamNumber;
    }

    public String getTeamTitle() {
        return teamTitle;
    }

    public void setTeamTitle(String teamTitle) {
        this.teamTitle = teamTitle;
    }
}
