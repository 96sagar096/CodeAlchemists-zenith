package org.example.localproblemsolver.dto;

public class RegisterResponse {
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    private String name;

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    private boolean success;
    private String token;
    public  RegisterResponse(String name , String token , boolean success)
    {
        this.name = name;
        this.success = success;
        this.token = token;
    }
}
