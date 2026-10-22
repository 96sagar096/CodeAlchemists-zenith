package org.example.localproblemsolver.controller;

import jakarta.validation.Valid;
import org.example.localproblemsolver.Service.UserComplaintService;
import org.example.localproblemsolver.dto.*;
import org.example.localproblemsolver.entity.ComplaintEvidence;
import org.example.localproblemsolver.repository.ComplaintEvidenceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaint")
@CrossOrigin("*")
public class ComplaintController {
    private final UserComplaintService userComplaintService;
    private final ComplaintEvidenceRepository complaintEvidenceRepository;

        public ComplaintController(UserComplaintService userComplaintService ,
                                   ComplaintEvidenceRepository complaintEvidenceRepository)
        {
            this.userComplaintService = userComplaintService;
            this.complaintEvidenceRepository = complaintEvidenceRepository;
        }
    @PreAuthorize("hasRole('USER')")
        @PostMapping("/registerComplaint")
        public ResponseEntity<ComplaintResponse> Airegister(
                 @RequestBody RegisterComplaintDTO request
        ) {


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            userComplaintService.createComplaint(request)
                    );
        }
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/my/{id}")

    public ResponseEntity<Complaint2Dto> register(
            @Valid @PathVariable Long id
    ) {


        return ResponseEntity.ok(
                userComplaintService.getMyComplaint(id)
        );


    }
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/my")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints() {

        return ResponseEntity.ok(
                userComplaintService.getMyComplaints()
        );
    }
    @PreAuthorize("hasRole('DEPARTMENT_ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {

       String response=  userComplaintService.updateStatus(id, request.getStatus());

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message", response
                )
        );
    }
    @PreAuthorize("hasRole('DEPARTMENT_ADMIN')")
    @PostMapping(
            value = "/{id}/resolve",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )

    public ResponseEntity<?> resolveComplaint(
            @PathVariable Long id,
            @RequestParam("evidence") MultipartFile evidence) throws IOException {

        userComplaintService.resolveComplaint(id, evidence);

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message", "Complaint resolved successfully"
                )
        );
    }
    @PreAuthorize("hasRole('DEPARTMENT_ADMIN' , 'USER')")
    @GetMapping("/{id}/evidence")
    public ResponseEntity<byte[]> getEvidence(
            @PathVariable Long id) {

        ComplaintEvidence evidence =
                complaintEvidenceRepository.findByComplaintId(id)
                        .orElseThrow(() ->
                                new RuntimeException("Evidence not found"));

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(
                                evidence.getContentType()
                        )
                )
                .body(evidence.getFileData());
    }



}
