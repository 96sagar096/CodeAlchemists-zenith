package org.example.localproblemsolver.Service;


import org.example.localproblemsolver.dto.*;
import org.example.localproblemsolver.entity.*;
import org.example.localproblemsolver.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import static sun.font.CreatedFontTracker.MAX_FILE_SIZE;


@Service
public class UserComplaintService {
    private final  ComplaintRepository complaintRepository;
    private final CurrentUserService currentUserService;
    private final IncidentRepository incidentRepository;
    private  final DepartmentRepository departmentRepository;
    private final  Complaint2Repository complaint2Repository;
    private final AiComplaintService aiComplaintService;
    private final ComplaintEvidenceRepository evidenceRepository;


    private final ComplaintMapper complaintMapper;

    public UserComplaintService(ComplaintRepository complaintRepository,
                                IncidentRepository incidentRepository,
                                DepartmentRepository departmentRepository,
                                AiComplaintService aiComplaintService,
                                Complaint2Repository complaint2Repository,
                                CurrentUserService currentUserService,
                                ComplaintMapper complaintMapper,
                                ComplaintEvidenceRepository complaintEvidenceRepository
                            ){
        this.complaintRepository = complaintRepository;
        this.departmentRepository = departmentRepository;
        this.incidentRepository = incidentRepository;
        this.aiComplaintService = aiComplaintService;
        this.complaint2Repository = complaint2Repository;
        this.currentUserService = currentUserService;
        this.complaintMapper = complaintMapper;
        this.evidenceRepository = complaintEvidenceRepository;
    }


        @Transactional
        public ComplaintResponse createComplaint(
                RegisterComplaintDTO request
        ) {

            // 1. Get authenticated user
            User user = currentUserService.getCurrentUser();

            // 2. Analyze complaint using AI
            AiApiResponse aiApiResponse = aiComplaintService.analyzeComplaint(
                    request.getProblem()
            );




            // 3. Reject invalid complaint
            if (!aiApiResponse.isValid()) {
                throw new IllegalArgumentException(
                        "The submitted complaint is not valid"
                );
            }
            if(aiApiResponse.getLocation() == null){
                aiApiResponse.setLocation(request.getLocation());
            }

            // 4. Find department
            Department department =
                    departmentRepository
                            .findByNameIgnoreCase(
                                    aiApiResponse.getDepartment()
                            )
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "Department not found: "
                                                    + aiApiResponse.getDepartment()
                                    )
                            );

            // 5. Create incident
            Incident incident = new Incident(
                    aiApiResponse.getProblem(),
                    request.getProblem(),
                    aiApiResponse.getSeverity(),
                    IncidentStatus.REPORTED,
                    department,
                    aiApiResponse.getLocation()
            );


            // 6. Save incident
            incident = incidentRepository.save(incident);

            // 7. Create complaint
            Complaint complaint = new Complaint(
                    user,
                    incident,
                    request.getProblem(),
                    aiApiResponse.getLocation()

            );





            Complaint savedComplaint =
                    complaintRepository.save(complaint);

            return complaintMapper.toResponses(savedComplaint);








        }
    @Transactional(readOnly = true)
    public List<ComplaintResponse> getMyComplaints() {
        User user = currentUserService.getCurrentUser();

        return complaintRepository
                .findByUserId(user.getId())
                .stream()
                .map(complaintMapper::toResponses)
                .toList();


    }
    @Transactional(readOnly = true)
    public Complaint2Dto getMyComplaint(long id) {
        User user = currentUserService.getCurrentUser();

        return

                complaintMapper.toResponse( complaintRepository.findByUser_IdAndId(user.getId(), id)

                        .orElseThrow(() ->
                                new RuntimeException("Complaint not found")
                        )
                );




    }
    public String updateStatus(Long complaintId, IncidentStatus status) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() ->
                        new RuntimeException("Complaint not found"));

        Incident incident = complaint.getIncident();

        incident.setStatus(status);
        incidentRepository.save(incident);
        return "Updated succsecfully";

        // if Incident is managed by JPA,
        // Hibernate will update it automatically.
    }

    public void resolveComplaint(
            Long complaintId,
            MultipartFile evidence) throws IOException {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() ->
                        new RuntimeException("Complaint not found"));

        if (evidence == null || evidence.isEmpty()) {
            throw new RuntimeException("Evidence file is required");
        }


        validateFile(evidence);

        ComplaintEvidence complaintEvidence =
                new ComplaintEvidence();

        complaintEvidence.setComplaint(complaint);
        complaintEvidence.setFileName(evidence.getOriginalFilename());
        complaintEvidence.setContentType(evidence.getContentType());
        complaintEvidence.setFileSize(evidence.getSize());
        complaintEvidence.setFileData(evidence.getBytes());
        complaintEvidence.setUploadedAt(LocalDateTime.now());

        evidenceRepository.save(complaintEvidence);
        Incident incident =
                complaint.getIncident();
                        incident.setStatus(IncidentStatus.RESOLVED);
        incidentRepository.save(incident);
    }
    private void validateFile(MultipartFile file) {

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size must be less than 5 MB");
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !(contentType.equals("image/jpeg")
                        || contentType.equals("image/png")
                        || contentType.equals("image/webp"))) {

            throw new RuntimeException(
                    "Only JPG, PNG and WEBP images are allowed"
            );
        }
    }


}

