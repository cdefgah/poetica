package com.github.cdefgah.poetica.controllers;

import com.github.cdefgah.poetica.reports.restable.FullResultTableReportView;
import com.github.cdefgah.poetica.reports.restable.MediumResultTableReportView;
import com.github.cdefgah.poetica.reports.restable.model.ResultTableReportModel;
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

@RestController
@Transactional
public class ReportsController extends  AbstractController {

    //  ByteArrayResource resource = new ByteArrayResource(payload.getBytes(StandardCharsets.UTF_8));
    //  ByteArrayResource resource = new ByteArrayResource(payload.getBytes(Charset.forName("KOI8_R")));

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
                reportText = "Пока не реализовано";
                break;

            default:
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        String fileName = "resultsTable_" + reportFormat + "_" +
                                                       encodingName + "_" + this.getTimeStampPartForFileName()  +".txt";

        HttpHeaders header = this.getHttpHeaderForGeneratedFile(fileName);

        ByteArrayResource resource = new ByteArrayResource(reportText.getBytes(Charset.forName(encodingName)));

        return ResponseEntity.ok()
                .headers(header)
                .contentLength(resource.contentLength())
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(resource);
    }
}
