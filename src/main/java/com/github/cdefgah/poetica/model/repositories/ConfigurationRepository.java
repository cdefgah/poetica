package com.github.cdefgah.poetica.model.repositories;

import com.github.cdefgah.poetica.model.ConfigurationEntity;
import com.github.cdefgah.poetica.model.Email;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConfigurationRepository extends JpaRepository<ConfigurationEntity, Long> {


}
