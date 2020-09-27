package com.github.cdefgah.poetica;

import com.github.cdefgah.poetica.controllers.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class SmokeTest {

    @Autowired
    private AnswersController answersController;

    @Autowired
    private ConfigurationController configurationController;

    @Autowired
    private EmailsController emailsController;

    @Autowired
    private QuestionsController questionsController;

    @Autowired
    private ReportsController reportsController;

    @Autowired
    private ShutdownController shutdownController;

    @Autowired
    private TeamsController teamsController;

    @Test
    public void contextLoads() throws Exception {
        assert answersController != null;
        assert configurationController != null;
        assert emailsController != null;
        assert questionsController != null;
        assert  reportsController != null;
        assert shutdownController != null;
        assert teamsController != null;
    }
}