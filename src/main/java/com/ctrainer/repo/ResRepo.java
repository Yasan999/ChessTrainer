package com.ctrainer.repo;

import com.ctrainer.model.Res;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResRepo extends JpaRepository<Res, Long> {
    List<Res> findByUidOrderByTsDesc(Long uid);
    void deleteByUid(Long uid);
}