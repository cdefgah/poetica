package com.github.cdefgah.poetica.model.repositories;

import com.github.cdefgah.poetica.model.config.ConfigurationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Transactional
public interface ConfigurationRepository extends JpaRepository<ConfigurationRecord, Long> {


}
