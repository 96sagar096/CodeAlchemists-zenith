package org.example.localproblemsolver.repository;

import org.example.localproblemsolver.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DepartmentRepository
        extends JpaRepository<Department, Long> {
    Optional<Department> findByNameIgnoreCase(String name);
    Optional<Department> findById(Long id);
}