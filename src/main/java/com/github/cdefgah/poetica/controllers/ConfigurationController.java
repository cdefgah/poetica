package com.github.cdefgah.poetica.controllers;

import com.github.cdefgah.poetica.model.config.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.util.List;

@RestController
@Transactional
public class ConfigurationController {

    /**
     * Менеджер сущностей для взаимодействия с базой данных.
     */
    @Autowired
    private EntityManager entityManager;

    @Autowired
    private Configuration configuration;

    @RequestMapping(path = "/configuration/supported-report-encodings",
            method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<CharsetEncodingEntity[]> getSupportedReportEncodings() {
        return new ResponseEntity<>(Configuration.SUPPORTED_ENCODINGS, HttpStatus.OK);
    }

    @RequestMapping(path = "/configuration/actual-report-encoding-system-name",
            method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<ConfigurationValue> getActualReportEncodingSystemName() {
        TypedQuery<ConfigurationRecord> query =
                entityManager.createQuery("select configurationEntity from ConfigurationRecord " +
                        "configurationEntity where configurationEntity.key=:encodingKeyName",
                        ConfigurationRecord.class);

        query.setParameter("encodingKeyName", ConfigurationKeys.REPORTS_ENCODING.getKeyName());
        List<ConfigurationRecord> resultList = query.getResultList();
        String actualReportEncodingSystemName = Configuration.SUPPORTED_ENCODINGS[0].getSystemName();
        if (!resultList.isEmpty()) {
            ConfigurationRecord configurationRecord = resultList.get(0);
            actualReportEncodingSystemName = configurationRecord.getValue();
        }

        return new ResponseEntity<>(new ConfigurationValue(actualReportEncodingSystemName), HttpStatus.OK);
    }

    @RequestMapping(path = "/configuration/credited_questions_qty",
            method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<ConfigurationValue> getCreditedQuestionsQty() {
        return new ResponseEntity<>(new ConfigurationValue(configuration.getCreditedQuestionsQty()), HttpStatus.OK);
    }
}