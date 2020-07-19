package com.github.cdefgah.poetica.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import javax.persistence.EntityManager;
import org.springframework.transaction.annotation.Transactional;

@RestController
@Transactional
public class ReportsController {
    /**
     * Менеджер сущностей для взаимодействия с базой данных.
     */
    @Autowired
    private EntityManager entityManager;

    @RequestMapping(path = "/reports/teams", method = RequestMethod.GET)
    public ResponseEntity<Resource> getReport() throws IOException {

        String payload = "Жромотрульки тарампульки\nКекелушки мапатуршки!\n1234567890";

        HttpHeaders header = new HttpHeaders();
        header.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=myfile.txt");
        header.add("Cache-Control", "no-cache, no-store, must-revalidate");
        header.add("Pragma", "no-cache");
        header.add("Expires", "0");

        ByteArrayResource resource = new ByteArrayResource(payload.getBytes(StandardCharsets.UTF_8));

        return ResponseEntity.ok()
                .headers(header)
                .contentLength(resource.contentLength())
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(resource);
    }

    @RequestMapping(path = "/reports/kokoi", method = RequestMethod.GET)
    public ResponseEntity<Resource> getReportInKoi8R() throws IOException {

        String payload = "Ента кои-восимь ыр кадироффка. Дыдынц. " +
                "Жромотрульки тарампульки\nКекелушки мапатуршки!\n1234567890";

        HttpHeaders header = new HttpHeaders();
        header.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=myfile.txt");
        header.add("Cache-Control", "no-cache, no-store, must-revalidate");
        header.add("Pragma", "no-cache");
        header.add("Expires", "0");

        ByteArrayResource resource = new ByteArrayResource(payload.getBytes(Charset.forName("KOI8_R")));

        return ResponseEntity.ok()
                .headers(header)
                .contentLength(resource.contentLength())
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(resource);
    }


    private static HttpHeaders getHttpHeaders(String reportFileNameWithExtension) {
        HttpHeaders header = new HttpHeaders();
        header.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + reportFileNameWithExtension);
        header.add("Cache-Control", "no-cache, no-store, must-revalidate");
        header.add("Pragma", "no-cache");
        header.add("Expires", "0");
        return header;
    }
}
