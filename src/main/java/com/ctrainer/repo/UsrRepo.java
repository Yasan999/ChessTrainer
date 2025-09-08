package com.ctrainer.repo;

import com.ctrainer.model.Usr;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsrRepo extends JpaRepository<Usr, Long> {
    Optional<Usr> findByNick(String nick);
}