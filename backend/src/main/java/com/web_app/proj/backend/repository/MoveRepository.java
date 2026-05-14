// repository/MoveRepository.java
package com.web_app.proj.backend.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web_app.proj.backend.model.Game;
import com.web_app.proj.backend.model.Move;

public interface MoveRepository extends JpaRepository<Move, Long> {
    List<Move> findByGameOrderByMoveNumberAsc(Game game);
    long countByGame(Game game);
}