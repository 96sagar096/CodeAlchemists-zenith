package org.example.localproblemsolver.repository;

import org.example.localproblemsolver.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IncidentRepository
        extends JpaRepository<Incident, Long> {

    List<Incident> findByDepartmentId(Long a);
}