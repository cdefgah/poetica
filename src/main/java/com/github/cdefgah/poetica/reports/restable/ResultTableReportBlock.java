package com.github.cdefgah.poetica.reports.restable;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ResultTableReportBlock {

    /**
     * Строки для блока отчёта.
     */
    private final List<ResultTableReportRow> preliminaryRoundBlockReportRows = new ArrayList<>();

    /**
     * Для расчёта рейтинга вопросов в блоке отчёта.
     */
    private final Map<Integer, Integer> allQuestionsRatingMap = new HashMap<>();
}
