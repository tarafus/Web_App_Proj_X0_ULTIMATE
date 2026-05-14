// repository/GameStatRepository.java
package com.web_app.proj.backend.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web_app.proj.backend.model.GameStat;
import com.web_app.proj.backend.model.User;

public interface GameStatRepository extends JpaRepository<GameStat, Long> {
    Optional<GameStat> findByUser(User user);
}