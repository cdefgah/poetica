package com.github.cdefgah.poetica.model.config;

import com.github.cdefgah.poetica.controllers.ConfigurationController;
import org.springframework.beans.factory.annotation.Autowired;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.util.List;

public class Configuration {

    private static final int DEFAULT_CREDITED_QUESTIONS_QTY = 5;

    public static final CharsetEncodingEntity[] SUPPORTED_ENCODINGS = {
            new CharsetEncodingEntity("Юникод (Unicode)", "UTF8"),
            new CharsetEncodingEntity("КОИ-8Р (KOI-8R)", "KOI8_R")
    };

    /**
     * Менеджер сущностей для взаимодействия с базой данных.
     */
    @Autowired
    private EntityManager entityManager;

    public Configuration() {

    }

    public int getCreditedQuestionsQty() {
        TypedQuery<ConfigurationRecord> query =
                entityManager.createQuery("select configurationEntity from ConfigurationRecord " +
                                "configurationEntity where configurationEntity.key=:encodingKeyName",
                        ConfigurationRecord.class);

        query.setParameter("encodingKeyName", ConfigurationKeys.CREDITED_QUESTIONS_QTY.getKeyName());
        List<ConfigurationRecord> resultList = query.getResultList();
        int creditedQuestionsQty = DEFAULT_CREDITED_QUESTIONS_QTY;
        if (!resultList.isEmpty()) {
            ConfigurationRecord configurationRecord = resultList.get(0);
            creditedQuestionsQty = Integer.parseInt(configurationRecord.getValue());
        }

        return creditedQuestionsQty;
    }
}
