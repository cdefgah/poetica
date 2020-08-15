package com.github.cdefgah.poetica.model.repositories;

import com.github.cdefgah.poetica.model.Answer;
import com.github.cdefgah.poetica.reports.collection.CollectionReportRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface AnswersRepository extends JpaRepository<Answer, Long> {

    // TODO сделать параметризацию и оставить один метод
    @Query("SELECT new com.github.cdefgah.poetica.reports.collection.CollectionReportRecord(answer.questionNumber, answer.body, count(*)) " +
            "FROM " +
            "    Answer answer" +
            "    WHERE answer.grade='Accepted'" +
            "    GROUP BY answer.body" +
            "    ORDER BY answer.questionNumber, answer.body")
    List<CollectionReportRecord> getCollectionRecordsForAcceptedAnswers();

    @Query("SELECT new com.github.cdefgah.poetica.reports.collection.CollectionReportRecord(answer.questionNumber, answer.body, count(*)) " +
            "FROM " +
            "    Answer answer" +
            "    WHERE answer.grade='NotAccepted'" +
            "    GROUP BY answer.body" +
            "    ORDER BY answer.questionNumber, answer.body")
    List<CollectionReportRecord> getCollectionRecordsForNotAcceptedAnswers();

}
