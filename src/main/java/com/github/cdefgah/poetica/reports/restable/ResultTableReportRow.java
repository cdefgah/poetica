package com.github.cdefgah.poetica.reports.restable;

import com.github.cdefgah.poetica.model.Answer;
import com.github.cdefgah.poetica.model.Grade;
import com.github.cdefgah.poetica.model.Team;
import org.springframework.beans.factory.annotation.Autowired;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;

/**
 * Содержательная строка отчёта с таблицей результатов.
 */
class ResultTableReportRow {

    /**
     * Менеджер сущностей для взаимодействия с базой данных.
     */
    @Autowired
    EntityManager entityManager;

    private int teamNumber;

    private boolean[] answerFlags;

    private AnsweredQuestionsDigest answeredQuestionsDigest = new AnsweredQuestionsDigest();

    private int teamRating;

    private String teamTitle;


    /**
     * Конструктор.
     * @param minQuestionNumber минимальный номер вопроса.
     * @param maxQuestionNumber максимальный номер вопроса.
     * @param isMainRound true, если блок отчёта относится к основному раунду.
     * @param team объект команды.
     * @param amountOfAnswersTakenInPreviousRound количество ответов, взятых в предыдущем раунде.
     */
    public ResultTableReportRow(int minQuestionNumber,
                                int maxQuestionNumber,
                                boolean isMainRound,
                                Team team,
                                int amountOfAnswersTakenInPreviousRound) {

        final int roundNumber = isMainRound ? 2 : 1;
        this.teamNumber = team.getNumber();
        this.teamTitle = team.getTitle();

        final int questionsAmount = maxQuestionNumber - minQuestionNumber + 1;
        answerFlags = new boolean[questionsAmount];

        int answerFlagIndex = 0;
        int takenAnswersAmount = 0;
        for(int questionNumber = minQuestionNumber; questionNumber <= maxQuestionNumber; questionNumber++) {
            answerFlags[answerFlagIndex] = isAnswerAccepted(questionNumber, team.getId(), roundNumber);
            if (answerFlags[answerFlagIndex]) {
                takenAnswersAmount++;
            }

            answerFlagIndex++;
        }

        answeredQuestionsDigest.setAmountOfTakenAnswersInThisRound(takenAnswersAmount);
        answeredQuestionsDigest.setAmountOfTakenAnswersInPreviousRound(amountOfAnswersTakenInPreviousRound);
    }

    private boolean isAnswerAccepted(int questionNumber, long teamId, int roundNumber) {
        TypedQuery<Answer> query =
                entityManager.createQuery("select answer from Answer answer " +
                                "where answer.teamId=:teamId and answer.questionNumber=:questionNumber " +
                                "and answer.roundNumber=:roundNumber and answer.grade:=grade " +
                                "order by answer.emailSentOn desc",
                Answer.class);
        query.setMaxResults(1); // нам нужна только одна запись

        query.setParameter("teamId", teamId);
        query.setParameter("questionNumber", questionNumber);
        query.setParameter("roundNumber", roundNumber);
        query.setParameter("grade", Grade.Accepted);

        return query.getSingleResult() != null;
    }

    public int getTeamNumber() {
        return teamNumber;
    }

    public boolean[] getAnswerFlags() {
        return answerFlags;
    }

    public AnsweredQuestionsDigest getAnsweredQuestionsDigest() {
        return answeredQuestionsDigest;
    }

    public int getTeamRating() {
        return teamRating;
    }

    public void setTeamRating(int teamRating) {
        this.teamRating = teamRating;
    }

    public String getTeamTitle() {
        return teamTitle;
    }
}