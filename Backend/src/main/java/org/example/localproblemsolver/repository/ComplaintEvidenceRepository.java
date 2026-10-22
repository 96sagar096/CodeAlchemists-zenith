package org.example.localproblemsolver.repository;

import org.example.localproblemsolver.entity.Complaint;
import org.example.localproblemsolver.entity.ComplaintEvidence;
import org.hibernate.boot.jaxb.mapping.spi.JaxbPersistentAttribute;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ComplaintEvidenceRepository  extends JpaRepository<ComplaintEvidence, Long> {
    Optional<ComplaintEvidence> findByComplaintId(Long complaintId);
}
