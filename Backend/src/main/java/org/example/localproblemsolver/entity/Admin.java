package org.example.localproblemsolver.entity;

import jakarta.persistence.*;
import org.example.localproblemsolver.dto.DepartmentName;


@Entity
@Table(name = "admin")
public class Admin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;




    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }



    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    @Column(nullable = false)
    private String passwordHash;



    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    protected Admin() {
    }

    public Admin( Department department, String passwordHash ) {

        this.department = department;

        this.passwordHash = passwordHash;

    }


}
