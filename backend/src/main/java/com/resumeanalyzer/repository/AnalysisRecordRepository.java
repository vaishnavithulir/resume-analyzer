package com.resumeanalyzer.repository;

import com.resumeanalyzer.entity.AnalysisRecord;
import com.resumeanalyzer.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalysisRecordRepository extends JpaRepository<AnalysisRecord, Long> {

    List<AnalysisRecord> findAllByOrderByCreatedAtDesc();

    Page<AnalysisRecord> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<AnalysisRecord> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
}
