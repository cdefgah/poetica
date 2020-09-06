package com.github.cdefgah.poetica.reports.collection.model;

import com.github.cdefgah.poetica.model.Answer;
import com.github.cdefgah.poetica.reports.ReportWithConsistencyCheck;
import com.github.cdefgah.poetica.reports.collection.model.comparators.QuestionNumberAnswerBodyAndCommentComparator;

import javax.persistence.EntityManager;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class CollectionReportModel extends ReportWithConsistencyCheck {

    private final List<AnswerSummaryBlock> answerSummaryBlocks = new ArrayList<>();

    public CollectionReportModel(EntityManager entityManager) {
        super(entityManager);

        if (this.isReportModelConsistent()) {
            // если в отчёте нет ошибок - считаем дальше
            buildMainReport();
        }
    }

    public List<AnswerSummaryBlock> getAnswerSummaryBlocks() {
        return Collections.unmodifiableList(answerSummaryBlocks);
    }

    private void buildMainReport() {
        // сортируем список ответов по номеру и телу ответа вместе с комментарием
        this.allRecentAnswersList.sort(new QuestionNumberAnswerBodyAndCommentComparator());

        Answer processingAnswer = this.allRecentAnswersList.get(0);
        int currentProcessingQuestionNumber = processingAnswer.getQuestionNumber();
        String currentProcessingAnswerBodyWithComment = processingAnswer.getBodyWithComment();
        boolean currentIsAcceptedFlag = processingAnswer.isAccepted();
        int totalCount = 1;

        AnswerSummaryBlock answerSummaryBlock = new AnswerSummaryBlock(currentProcessingQuestionNumber);

        for (int i = 1; i < allRecentAnswersList.size(); i++) {
            processingAnswer = allRecentAnswersList.get(i);
            if (processingAnswer.getQuestionNumber() != currentProcessingQuestionNumber) {
                // сменился номер вопроса
                // следовательно должен смениться answerSummaryBlock

                // фиксируем текущую ситуацию в текущем answerSummaryBlock
                answerSummaryBlock.registerAnswer(currentProcessingAnswerBodyWithComment,
                                                                                    totalCount, currentIsAcceptedFlag);

                // добавляем сформированный блок в список
                answerSummaryBlocks.add(answerSummaryBlock);

                // инициализируем новый блок
                currentProcessingQuestionNumber = processingAnswer.getQuestionNumber();
                currentProcessingAnswerBodyWithComment = processingAnswer.getBodyWithComment();
                currentIsAcceptedFlag = processingAnswer.isAccepted();
                totalCount = 1;

                answerSummaryBlock = new AnswerSummaryBlock(currentProcessingQuestionNumber);


            } else if (!processingAnswer.getBodyWithComment().equals(currentProcessingAnswerBodyWithComment)) {
                // сменился ответ внутри answerSummaryBlock
                answerSummaryBlock.registerAnswer(currentProcessingAnswerBodyWithComment,
                                                                                    totalCount, currentIsAcceptedFlag);

                currentProcessingAnswerBodyWithComment = processingAnswer.getBodyWithComment();
                totalCount = 1;
                currentIsAcceptedFlag = processingAnswer.isAccepted();

            } else {
                // ответ не меняется
                totalCount++;
            }
        }

        // фиксируем последний объект
        answerSummaryBlock.registerAnswer(currentProcessingAnswerBodyWithComment, totalCount, currentIsAcceptedFlag);

        // добавляем его в список
        answerSummaryBlocks.add(answerSummaryBlock);
    }


    // ==========================================================================================================
    public static final class AnswerSummaryBlock {
        private final int questionNumber;
        private final List<AnswerSummaryRow> acceptedAnswers = new ArrayList<>();
        private final List<AnswerSummaryRow> declinedAnswers = new ArrayList<>();

        public AnswerSummaryBlock(int questionNumber) {
            this.questionNumber = questionNumber;
        }

        public void registerAnswer(String answerBodyWithComment, int totalCount, boolean isAccepted) {
            if (isAccepted) {
                this.acceptedAnswers.add(new AnswerSummaryRow(answerBodyWithComment, totalCount));
            } else {
                this.declinedAnswers.add(new AnswerSummaryRow(answerBodyWithComment, totalCount));
            }
        }

        public int getQuestionNumber() {
            return questionNumber;
        }

        public List<AnswerSummaryRow> getAcceptedAnswers() {
            return Collections.unmodifiableList(acceptedAnswers);
        }

        public List<AnswerSummaryRow> getDeclinedAnswers() {
            return Collections.unmodifiableList(declinedAnswers);
        }

        // =====================================================================================================
        public static final class AnswerSummaryRow {
            private final String answerBodyWithComment;
            private final int totalCount;

            public AnswerSummaryRow(String answerBodyWithComment, int totalCount) {
                this.answerBodyWithComment = answerBodyWithComment;
                this.totalCount = totalCount;
            }

            public String getAnswerBodyWithComment() {
                return answerBodyWithComment;
            }

            public int getTotalCount() {
                return totalCount;
            }

            @Override
            public String toString() {
               if (totalCount > 1) {
                   // выдача с хэш-кодом строки, чтобы видеть идентичные строки. Нужна иногда для отладки
                   // return this.answerBodyWithComment + " [" + totalCount + "]" + " " + Objects.hash(this.answerBodyWithComment);
                   return this.answerBodyWithComment + " [" + totalCount + "]";
               } else {
                   // выдача с хэш-кодом строки, чтобы видеть идентичные строки. Нужна иногда для отладки
                   // return this.answerBodyWithComment  + " " + Objects.hash(this.answerBodyWithComment);
                   return this.answerBodyWithComment;
               }
            }
        }
    }
}