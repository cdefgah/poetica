/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (c) 2020 by Rafael Osipov <rafael.osipov@outlook.com>
 */

package com.github.cdefgah.poetica.controllers;

import com.github.cdefgah.poetica.model.Question;
import com.github.cdefgah.poetica.reports.collection.CollectionReportView;
import com.github.cdefgah.poetica.reports.collection.model.CollectionReportModel;
import com.github.cdefgah.poetica.reports.restable.FullResultTableReportView;
import com.github.cdefgah.poetica.reports.restable.MediumResultTableReportView;
import com.github.cdefgah.poetica.reports.restable.ShortResultTableReportView;
import com.github.cdefgah.poetica.reports.restable.model.ResultTableReportModel;
import com.github.cdefgah.poetica.reports.summary.SummaryReportView;
import com.github.cdefgah.poetica.reports.summary.model.SummaryReportModel;
import com.github.cdefgah.poetica.utils.AppVersion;

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

/**
 * Контроллер, отвечает за генерацию отчётов.
 */
@RestController
@Transactional
public class ReportsController extends  AbstractController {

    /**
     * Отдаёт текстовый файл с отчётом "Таблица результатов".
     * @param reportFormat формат отчёта.
     * @param encodingName системное имя кодировки символов, которая должна использоваться при генерации файла.
     * @return текстовый файл с отчётом "Таблица результатов".
     */
    @RequestMapping(path = "/reports/results-table/{reportFormat}/{encodingName}", method = RequestMethod.GET)
    public ResponseEntity<Resource> getResultsTableReport(@PathVariable String reportFormat,
                                                                                    @PathVariable String encodingName) {
        final String fullFormat = "Full";
        final String mediumFormat ="Medium";
        final String shortFormat = "Short";

        final String reportText;
        final ResultTableReportModel reportModel = new ResultTableReportModel(this.entityManager);
        reportModel.generateReport();

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

    /**
     * Формирует и выгружает отчёт с заданиями без авторских ответов (для публикации).
     * @param encodingName системное имя кодировки символов, которая должна использоваться при генерации файла.
     * @return текстовый файл с содержимым отчёта.
     */
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

    /**
     * Формирует и выгружает отчёт с заданиями с авторскими ответами (для публикации).
     * @param encodingName системное имя кодировки символов, которая должна использоваться при генерации файла.
     * @return текстовый файл с содержимым отчёта.
     */
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

    /**
     * Отдаёт текущий номер версии приложения.
     * @return текущий номер версии приложения.
     */
    @RequestMapping(path = "/reports/app-version", method = RequestMethod.GET, produces = "text/plain")
    public ResponseEntity<String> getAppVersion() {
        return ResponseEntity.ok().body(AppVersion.CURRENT_VERSION);
    }

    /**
     * Формирует и отдаёт отчёт "Собрание сочинений" в виде текстового файла.
     * @param encodingName системное имя кодировки символов, которая должна использоваться при генерации файла.
     * @return текстовый файл с содержимым отчёта.
     */
    @RequestMapping(path = "/reports/collection/{encodingName}", method = RequestMethod.GET)
    public ResponseEntity<Resource> exportCollectionReport(@PathVariable String encodingName) {

        final CollectionReportModel reportModel = new CollectionReportModel(entityManager);
        reportModel.generateReport();

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
     * Формирует и отдаёт текстовый файл с отчётом "Сводка".
     * @param encodingName системное имя кодировки символов, которая должна использоваться при генерации файла.
     * @return текстовый файл с отчётом "Сводка".
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

    /**
     * Отдаёт список со всем заданиями из базы данных.
     * @return список со всем заданиями из базы данных.
     */
    private List<Question> getAllQuestionObjects() {
        TypedQuery<Question> query = entityManager.
                createQuery("select question from Question question", Question.class);

        return query.getResultList();
    }
}
