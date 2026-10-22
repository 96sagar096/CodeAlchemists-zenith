package org.example.localproblemsolver.entity;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

public enum UserRole {

    USER,
    DEPARTMENT_ADMIN,
    SUPER_ADMIN;
    public List<SimpleGrantedAuthority> getAuthorities() {
        return List.of( new SimpleGrantedAuthority("ROLE_" + this.name()) ); }
}