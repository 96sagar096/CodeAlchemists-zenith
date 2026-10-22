package org.example.localproblemsolver.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.example.localproblemsolver.entity.Severity;

import java.time.LocalDateTime;

public class AiApiResponse {
    public String getProblem() {
        return problem;
    }
    @JsonProperty("isValid")
    private  boolean isValid;


    @JsonProperty("isValid")
    public boolean isValid() {
        return isValid;
    }
    @JsonProperty("isValid")
    public void setValid(boolean valid) {
        isValid = valid;
    }


    public void setProblem(String problem) {
        this.problem = problem;
    }

    private String problem;
    private String Location;

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }

    public String getLocation() {
        return Location;
    }

    public void setLocation(String location) {
        Location = location;
    }

    private String department;
    private Severity severity;




}
