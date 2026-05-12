package com.web_app.proj.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web_app.proj.backend.model.Game;

public interface GameRepository extends JpaRepository<Game, Long> {
}
