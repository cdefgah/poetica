package com.github.cdefgah.poetica.model.repositories;

import com.github.cdefgah.poetica.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionsRepository extends JpaRepository<Question, Long> {

}
