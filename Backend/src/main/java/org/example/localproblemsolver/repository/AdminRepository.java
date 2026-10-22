package org.example.localproblemsolver.repository;

import org.example.localproblemsolver.entity.Admin;
import org.example.localproblemsolver.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findById(Long Id);
}
