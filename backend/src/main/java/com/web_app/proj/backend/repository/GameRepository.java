package com.web_app.proj.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.web_app.proj.backend.model.Game;
import com.web_app.proj.backend.model.GameStatus;
import com.web_app.proj.backend.model.User;

public interface GameRepository extends JpaRepository<Game, Long> {

    @Query("SELECT g FROM Game g WHERE (g.player1 = :user OR g.player2 = :user) AND g.status = :status")
    List<Game> findByPlayerAndStatus(@Param("user") User user, @Param("status") GameStatus status);
}