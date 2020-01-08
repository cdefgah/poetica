package com.cdefgah.poetica.model.repositories;

import com.cdefgah.poetica.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionsRepository extends JpaRepository<Question, Long> {

}
