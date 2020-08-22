package com.github.cdefgah.poetica.controllers;

import com.github.cdefgah.poetica.model.Grade;
import com.github.cdefgah.poetica.model.Question;
import com.github.cdefgah.poetica.model.Team;
import com.github.cdefgah.poetica.model.repositories.AnswersRepository;
import com.github.cdefgah.poetica.reports.collection.CollectionReportView;
import com.github.cdefgah.poetica.reports.collection.model.CollectionReportModel;
import com.github.cdefgah.poetica.reports.restable.FullResultTableReportView;
import com.github.cdefgah.poetica.reports.restable.MediumResultTableReportView;
import com.github.cdefgah.poetica.reports.restable.ShortResultTableReportView;
import com.github.cdefgah.poetica.reports.restable.model.ResultTableReportModel;
import com.github.cdefgah.poetica.reports.summary.SummaryReportView;
import com.github.cdefgah.poetica.reports.summary.model.SummaryReportModel;
import com.github.cdefgah.poetica.utils.AppVersion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.persistence.TypedQuery;
import java.nio.charset.Charset;
import java.util.List;

@RestController
@Transactional
public class ReportsController extends  AbstractController {

    @Autowired
    AnswersRepository answersRepository;

    @RequestMapping(path = "/reports/results-table/{reportFormat}/{encodingName}", method = RequestMethod.GET)
    public ResponseEntity<Resource> getResultsTableReport(@PathVariable String reportFormat,
                                                                                    @PathVariable String encodingName) {
        final String fullFormat = "Full";
        final String mediumFormat ="Medium";
        final String shortFormat = "Short";

        final String reportText;
        final ResultTableReportModel reportModel = new ResultTableReportModel(this.entityManager);
        switch (reportFormat) {
            case fullFormat:
                reportText = (new FullResultTableReportView(reportModel)).getReportText();
                break;

            case mediumFormat:
                reportText = (new MediumResultTableReportView(reportModel)).getReportText();
                break;

            case shortFormat:
                reportText = (new ShortResultTableReportView(reportModel)).getReportText();
                break;

            default:
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        String fileName = "resultsTable_" + reportFormat + "_" +
                                                       encodingName + "_" + this.getTimeStampPartForFileName() +".txt";

        HttpHeaders header = this.getHttpHeaderForGeneratedFile(fileName);

        ByteArrayResource resource = new ByteArrayResource(reportText.getBytes(Charset.forName(encodingName)));

        return ResponseEntity.ok()
                .headers(header)
                .contentLength(resource.contentLength())
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(resource);
    }

    private List<Question> getAllQuestionObjects() {
        TypedQuery<Question> query = entityManager.
                createQuery("select question from Question question", Question.class);

        return query.getResultList();
    }

    @RequestMapping(path = "/reports/questions-without-answers/{encodingName}", method = RequestMethod.GET)
    public ResponseEntity<Resource> exportQuestionsWithoutAnswersReport(@PathVariable String encodingName) {

        List<Question> allQuestions = getAllQuestionObjects();

        StringBuilder payload = new StringBuilder();
        for (Question question: allQuestions) {
            payload.append(question.getQuestionBodyOnly()).append('\n');
        }

        final String reportText = payload.toString();
        String fileName = "questionsWithoutAnswers_" + "_" + encodingName + "_" +
                                                                            this.getTimeStampPartForFileName() +".txt";
        HttpHeaders header = this.getHttpHeaderForGeneratedFile(fileName);

        ByteArrayResource resource = new ByteArrayResource(reportText.getBytes(Charset.forName(encodingName)));

        return ResponseEntity.ok()
                .headers(header)
                .contentLength(resource.contentLength())
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(resource);
    }

    @RequestMapping(path = "/reports/questions-with-answers/{encodingName}", method = RequestMethod.GET)
    public ResponseEntity<Resource> exportQuestionsWithAnswersReport(@PathVariable String encodingName) {

        List<Question> allQuestions = getAllQuestionObjects();

        StringBuilder payload = new StringBuilder();
        for (Question question: allQuestions) {
            payload.append(question.getQuestionWithAllProperties()).append('\n');
        }

        final String reportText = payload.toString();
        String fileName = "questionsWithAnswers_" + "_" + encodingName + "_" +
                this.getTimeStampPartForFileName() +".txt";
        HttpHeaders header = this.getHttpHeaderForGeneratedFile(fileName);

        ByteArrayResource resource = new ByteArrayResource(reportText.getBytes(Charset.forName(encodingName)));

        return ResponseEntity.ok()
                .headers(header)
                .contentLength(resource.contentLength())
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(resource);
    }

    @RequestMapping(path = "/reports/teams-with-not-graded-answers/{encodingName}", method = RequestMethod.GET)
    public ResponseEntity<Resource> exportTeamsWithNotGradedAnswers(@PathVariable String encodingName) {
        TypedQuery<Team> query = entityManager.createQuery("select distinct team from Team team, " +
                "Answer answer where team.id=answer.teamId and answer.grade=:grade", Team.class);
        query.setParameter("grade", Grade.None);
        final List<Team> teamsList = query.getResultList();
        final StringBuilder sb = new StringBuilder();

        sb.append("В нижеприведенном списке - названия и номера команд, у которых не все ответы получили оценку\n");
        sb.append("Чтобы увидеть ответы без оценок для той или иной команды, откройте страницу 'Ответы' в программе,\n");
        sb.append("После чего выберите команду из выпадающего списка, выберите значение 'Все' в блоке отбора ответов\n");
        sb.append("И выберите закладку 'Ответы без оценок'\n");
        sb.append("Кроме того, строки в таблице с ответами без оценок помечаются цветом\n\n");

        sb.append("Список команд, у которых не все ответы получили оценку:\n\n");

        for (Team team: teamsList) {
            sb.append(team.getTitle()).append(',').append(team.getNumber()).append('\n');
        }

        final String reportText = sb.toString();
        String fileName = "teamsWithNotGradedAnswers_" + "_" + encodingName + "_" +
                this.getTimeStampPartForFileName() +".txt";
        HttpHeaders header = this.getHttpHeaderForGeneratedFile(fileName);

        ByteArrayResource resource = new ByteArrayResource(reportText.getBytes(Charset.forName(encodingName)));

        return ResponseEntity.ok()
                .headers(header)
                .contentLength(resource.contentLength())
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(resource);
    }

    @RequestMapping(path = "/reports/app-version", method = RequestMethod.GET, produces = "text/plain")
    public ResponseEntity<String> getAppVersion() {
        return ResponseEntity.ok().body(AppVersion.CURRENT_VERSION);
    }

    /**
     * Отчёт "Собрание сочинений".
     * @param encodingName кодировка отчёта.
     * @return объект ответа HTTP с отчётом.
     */
    @RequestMapping(path = "/reports/collection/{encodingName}", method = RequestMethod.GET)
    public ResponseEntity<Resource> exportCollectionReport(@PathVariable String encodingName) {

        final CollectionReportModel reportModel = new CollectionReportModel(entityManager);
        final CollectionReportView report = new CollectionReportView(reportModel);

        final String reportText = report.getReportText();
        String fileName = "collection_" + "_" + encodingName + "_" +
                this.getTimeStampPartForFileName() +".txt";
        HttpHeaders header = this.getHttpHeaderForGeneratedFile(fileName);

        ByteArrayResource resource = new ByteArrayResource(reportText.getBytes(Charset.forName(encodingName)));

        return ResponseEntity.ok()
                .headers(header)
                .contentLength(resource.contentLength())
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(resource);
    }

    /**
     * Отчёт "Сводка".
     * @param encodingName кодировка отчёта.
     * @return объект ответа HTTP с отчётом.
     */
    @RequestMapping(path = "/reports/summary/{roundNumber}/{encodingName}", method = RequestMethod.GET)
    public ResponseEntity<Resource> exportSummaryReport(@PathVariable int roundNumber,
                                                        @PathVariable String encodingName) {

        final SummaryReportModel reportModel = new SummaryReportModel(entityManager, roundNumber);
        final SummaryReportView report = new SummaryReportView(reportModel);

        final String reportText = report.getReportText();

        String roundName = roundNumber == 1 ? "Preliminary_Round" : "Main_Round";
        String fileName = "summary_" + roundName + "_" + encodingName + "_" +
                                                                        this.getTimeStampPartForFileName() +".txt";

        HttpHeaders header = this.getHttpHeaderForGeneratedFile(fileName);

        ByteArrayResource resource = new ByteArrayResource(reportText.getBytes(Charset.forName(encodingName)));

        return ResponseEntity.ok()
                .headers(header)
                .contentLength(resource.contentLength())
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(resource);
    }
}
