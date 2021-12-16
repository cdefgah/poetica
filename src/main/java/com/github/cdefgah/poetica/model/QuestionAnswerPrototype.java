package com.github.cdefgah.poetica.model;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Прототип для классов, в которых нужно использовать SHA-512 хэширование текста.
 */
public abstract class QuestionAnswerPrototype {

    /**
     * Формирует SHA-512 хэш из ненормализованного текста.
     * @param textToHash текст, который нужно хэшировать.
     * @return строка с SHA-512 хэшем для переданного текста.
     */
    protected String getHashForRawText(String textToHash) {
        return generateSHA512FromText(normalizeText(textToHash));
    }

    /**
     * Убирает все пробелы и табуляции между словами, и проставляет по одному пробелу между ними.
     * Метод используется для расчёта SHA-512 хэш кода для ответа, для дальнейшего поиска схожих ответов.
     *
     * @param textToNormalize текст для нормализации.
     * @return нормализованный текст.
     */
    private static String normalizeText(String textToNormalize) {
        return textToNormalize.replaceAll("[\\t\\n\\r]+", " ").replaceAll(" +", " ");
    }

    /**
     * Формирует SHA-512 хэш из текста.
     *
     * @param textToHash текст, который надо хэшировать.
     * @return строка с SHA-512 хэшем для переданного текста.
     */
    private static String generateSHA512FromText(String textToHash) {
        try {
            MessageDigest messageDigest = MessageDigest.getInstance("SHA-512");

            byte[] bytes = messageDigest.digest(textToHash.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte oneByte : bytes) {
                sb.append(Integer.toString((oneByte & 0xff) + 0x100, 16).substring(1));
            }

            return sb.toString();

        } catch (NoSuchAlgorithmException ex) {
            // выполнение сюда не должно попадать
            throw new RuntimeException(ex);
        }
    }
}
