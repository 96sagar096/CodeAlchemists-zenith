package org.example.localproblemsolver.controller;

import org.example.localproblemsolver.Service.AdminComplaintService;
import org.example.localproblemsolver.dto.AdminComplaintResponse;
import org.example.localproblemsolver.dto.AdminPageDetails;
import org.example.localproblemsolver.dto.ComplaintResponse;
import org.example.localproblemsolver.dto.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/adminInfo")
@CrossOrigin("*")
public class AdminComplaintController {
    private final AdminComplaintService adminComplaintService;

    public AdminComplaintController(AdminComplaintService adminComplaintService){
        this.adminComplaintService
                        = adminComplaintService;}

    @PreAuthorize("hasRole('DEPARTMENT_ADMIN')")
    @GetMapping("/complaints")
    public ResponseEntity<AdminPageDetails> getAdminComplaints() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();
        Principal principal =
                (Principal) authentication.getPrincipal();
        Long departmentId =
                principal.getDepthId();


        AdminPageDetails adminPageDetails = adminComplaintService.getAdminComplaints(departmentId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(adminPageDetails
                );


    }
}
