package org.example.localproblemsolver.dto;

import java.util.List;

public class AdminPageDetails {
    private String departmentName;

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public List<AdminComplaintResponse> getComplaintResponses() {
        return complaintResponses;
    }

    public void setComplaintResponses(List<AdminComplaintResponse> complaintResponses) {
        this.complaintResponses = complaintResponses;
    }

    private List<AdminComplaintResponse> complaintResponses;

}
