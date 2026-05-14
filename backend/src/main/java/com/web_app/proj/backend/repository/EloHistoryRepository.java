// repository/EloHistoryRepository.java
package com.web_app.proj.backend.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web_app.proj.backend.model.EloHistory;
import com.web_app.proj.backend.model.User;

public interface EloHistoryRepository extends JpaRepository<EloHistory, Long> {
    List<EloHistory> findByUserOrderByRecordedAtDesc(User user);
}