package org.example.localproblemsolver.repository;


import org.example.localproblemsolver.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ComplaintRepository
        extends JpaRepository<Complaint, Long> {
    List<Complaint> findByUserId(Long userId);
    Optional<Complaint> findByUser_IdAndId(Long userId, Long complaintId);
}