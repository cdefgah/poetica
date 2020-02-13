package com.github.cdefgah.poetica.controllers;

import com.github.cdefgah.poetica.model.ConfigurationEntity;
import com.github.cdefgah.poetica.model.ConfigurationKeys;
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

    private static final CharsetEncodingEntity[] supportedReportEncodings = {
            new CharsetEncodingEntity("Юникод (Unicode)", "UTF8"),
            new CharsetEncodingEntity("КОИ-8Р (KOI-8R)", "KOI8_R")
    };

    @RequestMapping(path = "/configuration/supported-report-encodings",
            method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<CharsetEncodingEntity[]> getSupportedReportEncodings() {
        return new ResponseEntity<>(supportedReportEncodings, HttpStatus.OK);
    }

    @RequestMapping(path = "/configuration/actual-report-encoding-system-name",
            method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<CharsetSystemName> getActualReportEncodingSystemName() {
        TypedQuery<ConfigurationEntity> query =
                entityManager.createQuery("select configurationEntity from ConfigurationEntity " +
                        "configurationEntity where configurationEntity.key=:encodingKeyName",
                        ConfigurationEntity.class);

        query.setParameter("encodingKeyName", ConfigurationKeys.REPORTS_ENCODING.getKeyName());
        List<ConfigurationEntity> resultList = query.getResultList();
        String actualReportEncodingSystemName = supportedReportEncodings[0].systemName;
        if (!resultList.isEmpty()) {
            ConfigurationEntity configurationEntity = resultList.get(0);
            actualReportEncodingSystemName = configurationEntity.getValue();
        }

        return new ResponseEntity<>(new CharsetSystemName(actualReportEncodingSystemName), HttpStatus.OK);
    }

    final static class CharsetSystemName {

        private final String name;

        public CharsetSystemName(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }
    }

    final static class CharsetEncodingEntity {
        private String humanReadableTitle;
        private String systemName;

        public CharsetEncodingEntity(String humanReadableTitle, String systemName) {
            this.humanReadableTitle = humanReadableTitle;
            this.systemName = systemName;
        }

        public String getHumanReadableTitle() {
            return humanReadableTitle;
        }

        public String getSystemName() {
            return systemName;
        }
    }
}
