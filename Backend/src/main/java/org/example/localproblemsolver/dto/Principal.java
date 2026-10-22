package org.example.localproblemsolver.dto;

public class Principal {
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        id = id;
    }

    public Long getDepthId() {
        return depthId;
    }

    public void setDepthId(Long depthId) {
        depthId = depthId;
    }

    private final Long id;
    private final Long depthId;

    public Principal(Long id , Long depthId){
        this.depthId = depthId;
        this.id = id;
    }


}
