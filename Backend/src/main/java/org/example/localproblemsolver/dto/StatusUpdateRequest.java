package org.example.localproblemsolver.dto;

import org.example.localproblemsolver.entity.IncidentStatus;

public class StatusUpdateRequest {

    private IncidentStatus status;

    public IncidentStatus getStatus() {
        return status;
    }

    public void setStatus(IncidentStatus status) {
        this.status = status;
    }
}