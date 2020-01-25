package com.github.cdefgah.poetica.model.repositories;

import com.github.cdefgah.poetica.model.Email;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailsRepository extends JpaRepository<Email, Long> {

}
