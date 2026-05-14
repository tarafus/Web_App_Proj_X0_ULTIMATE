package com.web_app.proj.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.web_app.proj.backend.model.Game;
import com.web_app.proj.backend.model.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByGameOrderBySentAtAsc(Game game);

    @Modifying
    @Transactional
    @Query("DELETE FROM Message m WHERE m.game = :game")
    void deleteByGame(@Param("game") Game game);
}