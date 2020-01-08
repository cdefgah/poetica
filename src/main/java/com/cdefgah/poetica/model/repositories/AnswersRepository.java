package com.cdefgah.poetica.model.repositories;

import com.cdefgah.poetica.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface AnswersRepository extends JpaRepository<Answer, Long> {

}
