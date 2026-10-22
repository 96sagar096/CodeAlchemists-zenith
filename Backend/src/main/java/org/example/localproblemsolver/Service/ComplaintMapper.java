package org.example.localproblemsolver.Service;



import org.example.localproblemsolver.dto.AdminComplaintResponse;
import org.example.localproblemsolver.dto.Complaint2Dto;
import org.example.localproblemsolver.dto.ComplaintResponse;
import org.example.localproblemsolver.entity.Complaint;
import org.example.localproblemsolver.entity.Incident;
import org.example.localproblemsolver.repository.ComplaintRepository;
import org.springframework.stereotype.Component;
@Component
public class ComplaintMapper {
    private final ComplaintRepository complaintRepository;


    public ComplaintMapper(ComplaintRepository complaintRepository){
        this.complaintRepository = complaintRepository;
    }

    public ComplaintResponse toResponses(Complaint complaint ) {
        Incident incident = complaint.getIncident();
        return new ComplaintResponse(
                complaint.getId(),
                incident.getId(),
                complaint.getDescription(),
                complaint.getCreatedAt(),
                incident.getDepartment().getName(),
                incident.getSeverity(),
                incident.getStatus().name() ,
                complaint.getLocation());

    }
    public Complaint2Dto toResponse(Complaint complaint ) {
        Incident incident = complaint.getIncident();
        return new Complaint2Dto(
                complaint.getId(),
                incident.getId(),
                complaint.getDescription(),
                complaint.getCreatedAt(),
                incident.getDepartment().getName(),
                incident.getSeverity(),
                incident.getStatus().name(),
                complaint.getLocation()
                );

    }
    public AdminComplaintResponse toAdminResponse(Incident incident) {
        Complaint complaint = complaintRepository.getById(incident.getId());
        return new AdminComplaintResponse(

                incident.getId(),
                incident.getDescription(),
                incident.getSeverity().toString(),
                incident.getStatus().toString(),
                incident.getTitle(),
                1,
                incident.getLocation(),
                complaint.getCreatedAt().toString()


        );


    }

}