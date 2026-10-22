package org.example.localproblemsolver.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.example.localproblemsolver.entity.Severity;

import java.time.LocalDateTime;

public class ComplaintResponse {



    private Long complaintId;
    private Long incidentId;
    private String description;
    private LocalDateTime createdAt;
    private String department;







    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }

    public Long getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(Long complaintId) {
        this.complaintId = complaintId;
    }

    public Long getIncidentId() {
        return incidentId;
    }

    public void setIncidentId(Long incidentId) {
        this.incidentId = incidentId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    private Severity severity;
    private String status;

    public ComplaintResponse() {

    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    private String location;
    public ComplaintResponse( Long complaintId,
                              Long incidentId,
                              String description,
                              LocalDateTime createdAt,
                              String department,
                              Severity severity,
                              String status,
                              String location
                             ) {
        this.complaintId = complaintId;
        this.incidentId = incidentId;
        this.description = description;
        this.createdAt = createdAt;
        this.department = department;
        this.severity = severity;
        this.status = status;
        this.location = location;

    }
}
