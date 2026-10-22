package org.example.localproblemsolver.dto;



import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateComplaintRequest {

    @NotBlank(message = "Complaint description is required")
    @Size(max = 5000, message = "Complaint cannot exceed 5000 characters")
    private String description;

    public CreateComplaintRequest() {
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}


