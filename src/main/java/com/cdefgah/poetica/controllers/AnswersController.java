package com.cdefgah.poetica.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RestController;

import javax.persistence.EntityManager;

@RestController
@Transactional
public class AnswersController extends AbstractController {

    @Autowired
    EntityManager entityManager;

}
