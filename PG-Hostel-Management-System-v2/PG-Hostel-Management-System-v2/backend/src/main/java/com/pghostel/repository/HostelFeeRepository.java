package com.pghostel.repository;

import com.pghostel.entity.HostelFee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HostelFeeRepository extends JpaRepository<HostelFee, Long> {
    List<HostelFee> findByCandidateId(Long candidateId);
}
