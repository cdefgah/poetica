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

    public Configuration() {

    }
}
